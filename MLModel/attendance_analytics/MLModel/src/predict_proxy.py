import argparse
import json
import os
import pickle
import sys
from pathlib import Path

import numpy as np
import pandas as pd


def parse_args():
    parser = argparse.ArgumentParser(description="Predict proxy probability")
    parser.add_argument("--model-dir", type=str, default="models", help="Directory with model artifacts")
    parser.add_argument("--input", type=str, required=True, help="Feature vector as CSV string")
    return parser.parse_args()


def load_artifacts(model_dir):
    model_path = Path(model_dir) / "proxy_model_rf.pkl"
    scaler_path = Path(model_dir) / "proxy_scaler.pkl"
    meta_path = Path(model_dir) / "proxy_meta.json"

    if not model_path.exists() or not scaler_path.exists() or not meta_path.exists():
        raise FileNotFoundError(f"Model artifacts not found in {model_dir}")

    with open(model_path, "rb") as f:
        model = pickle.load(f)
    with open(scaler_path, "rb") as f:
        scaler = pickle.load(f)
    with open(meta_path, "r") as f:
        meta = json.load(f)

    return model, scaler, meta


def feature_engineering_one(row):
    """Apply the same feature engineering as training."""
    df = pd.DataFrame([row])

    # Distance from reference point (Delhi campus)
    ref_lat, ref_lng = 28.6139, 77.2090
    df["dist_from_ref"] = np.sqrt((df["gps_lat"] - ref_lat) ** 2 + (df["gps_lng"] - ref_lng) ** 2)

    # IP private flag
    df["is_private_ip"] = (
        (df["ip_octet1"] == 10) |
        ((df["ip_octet1"] == 172) & (df["ip_octet2"] >= 16) & (df["ip_octet2"] <= 31)) |
        ((df["ip_octet1"] == 192) & (df["ip_octet2"] == 168))
    ).astype(int)

    # Time flags
    df["is_night"] = ((df["hour_of_day"] >= 22) | (df["hour_of_day"] <= 6)).astype(int)
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)

    # GPS accuracy flag
    df["poor_gps"] = (df["gps_accuracy"] > 100).astype(int)

    return df


def predict():
    args = parse_args()
    try:
        model, scaler, meta = load_artifacts(args.model_dir)
    except Exception as e:
        print(f"[ERROR] {e}", file=sys.stderr)
        # Fallback: simple heuristic
        values = list(map(float, args.input.split(",")))
        if len(values) < 11:
            print("0.25")
            return
        hour, day, lat, lng, acc, ip1, ip2, ip3, ip4, ua_len, fp_hash = values[:11]
        heuristic = (
            (acc > 100) * 0.3 +
            (hour < 6 or hour > 22) * 0.2 +
            (ip1 not in (10, 172, 192)) * 0.2 +
            (ua_len < 40) * 0.2
        )
        print(f"{min(1.0, heuristic):.4f}")
        return

    # Parse input CSV into a dict
    field_names = [
        "hour_of_day",
        "day_of_week",
        "gps_lat",
        "gps_lng",
        "gps_accuracy",
        "ip_octet1",
        "ip_octet2",
        "ip_octet3",
        "ip_octet4",
        "ua_length",
        "fp_hash",
    ]
    values = list(map(float, args.input.split(",")))
    if len(values) != len(field_names):
        raise ValueError(f"Expected {len(field_names)} values, got {len(values)}")
    row = dict(zip(field_names, values))

    # Feature engineering
    df = feature_engineering_one(row)

    # Ensure column order matches training
    X = df[meta["features"]]

    # Scale and predict
    X_scaled = scaler.transform(X)
    proba = model.predict_proba(X_scaled)[:, 1][0]

    print(f"{proba:.4f}")


if __name__ == "__main__":
    predict()
