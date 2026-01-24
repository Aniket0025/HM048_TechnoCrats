import argparse
import json
import os
import pickle
import sys
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler


def parse_args():
    parser = argparse.ArgumentParser(description="Train proxy detection model")
    parser.add_argument("--data", type=str, default="data/proxy_training.csv", help="Path to training CSV")
    parser.add_argument("--model-dir", type=str, default="models", help="Directory to save model")
    parser.add_argument("--test-size", type=float, default=0.2, help="Test split fraction")
    parser.add_argument("--random-state", type=int, default=42, help="Random seed")
    parser.add_argument("--model-type", type=str, default="rf", choices=["rf", "lr"], help="Model type")
    return parser.parse_args()


def load_data(path):
    if not Path(path).exists():
        print(f"[ERROR] Training data not found at {path}")
        print("Creating a dummy dataset for demonstration. Replace with real data for production.")
        return create_dummy_dataset(path)

    df = pd.read_csv(path)
    required = [
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
        "label",
    ]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns in data: {missing}")

    print(f"[INFO] Loaded {len(df)} rows from {path}")
    return df


def create_dummy_dataset(save_path):
    """Create a synthetic dataset for demonstration if no real data is provided."""
    print("[INFO] Generating dummy proxy detection dataset...")
    np.random.seed(42)
    n = 2000

    # Simulate legitimate vs proxy behavior
    legit_ratio = 0.85
    n_legit = int(n * legit_ratio)
    n_proxy = n - n_legit

    def generate_samples(is_proxy, count):
        samples = []
        for _ in range(count):
            # Time patterns: proxies more likely off-hours
            if is_proxy:
                hour = np.random.choice(np.concatenate([np.arange(0, 6), np.arange(22, 24)]), p=[0.2]*6 + [0.2]*2)
            else:
                hour = np.random.choice(np.arange(6, 22), p=[0.1]*16)

            # Location: proxies often have bad GPS accuracy or extreme coordinates
            if is_proxy:
                gps_acc = np.random.exponential(scale=150)  # often poor accuracy
                lat = np.random.uniform(12, 48)  # broader range
                lng = np.random.uniform(68, 132)
            else:
                gps_acc = np.random.exponential(scale=20)  # better accuracy
                # Example campus location (Delhi)
                lat = np.random.normal(28.6139, 0.01)
                lng = np.random.normal(77.2090, 0.01)

            # IP: proxies more likely to use public VPN ranges (simplified)
            if is_proxy:
                ip1 = np.random.choice([8, 172, 192, 203], p=[0.2, 0.3, 0.4, 0.1])
            else:
                ip1 = np.random.choice([10, 172, 192], p=[0.7, 0.2, 0.1])

            ip2, ip3, ip4 = np.random.randint(0, 256, size=3)

            # User agent length: proxies often have short or generic UAs
            ua_len = np.random.normal(40 if is_proxy else 120, 10)

            # Device fingerprint hash (numeric)
            fp_hash = np.random.randint(0, 1000)

            samples.append({
                "hour_of_day": int(hour),
                "day_of_week": np.random.randint(0, 7),
                "gps_lat": lat,
                "gps_lng": lng,
                "gps_accuracy": max(0, gps_acc),
                "ip_octet1": ip1,
                "ip_octet2": ip2,
                "ip_octet3": ip3,
                "ip_octet4": ip4,
                "ua_length": max(1, int(ua_len)),
                "fp_hash": fp_hash,
                "label": 1 if is_proxy else 0,
            })
        return samples

    data = generate_samples(False, n_legit) + generate_samples(True, n_proxy)
    df = pd.DataFrame(data)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    # Save for future use
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    df.to_csv(save_path, index=False)
    print(f"[INFO] Saved dummy dataset to {save_path}")
    return df


def feature_engineering(df):
    """Add derived features."""
    df = df.copy()

    # Distance from a reference point (e.g., campus)
    ref_lat, ref_lng = 28.6139, 77.2090
    df["dist_from_ref"] = np.sqrt((df["gps_lat"] - ref_lat) ** 2 + (df["gps_lng"] - ref_lng) ** 2)

    # IP-based features
    df["is_private_ip"] = (
        (df["ip_octet1"] == 10) |
        ((df["ip_octet1"] == 172) & (df["ip_octet2"] >= 16) & (df["ip_octet2"] <= 31)) |
        ((df["ip_octet1"] == 192) & (df["ip_octet2"] == 168))
    ).astype(int)

    # Time-based features
    df["is_night"] = ((df["hour_of_day"] >= 22) | (df["hour_of_day"] <= 6)).astype(int)
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)

    # GPS accuracy flag
    df["poor_gps"] = (df["gps_accuracy"] > 100).astype(int)

    return df


def train_model(df, args):
    y = df["label"]
    X = df.drop(columns=["label"])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=args.test_size, random_state=args.random_state, stratify=y
    )

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Choose model
    if args.model_type == "rf":
        model = RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            min_samples_leaf=4,
            random_state=args.random_state,
            n_jobs=-1,
        )
    else:
        model = LogisticRegression(max_iter=1000, random_state=args.random_state)

    model.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]

    print("[INFO] Evaluation on test set:")
    print(classification_report(y_test, y_pred, digits=4))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print(f"ROC AUC: {roc_auc_score(y_test, y_proba):.4f}")

    # Feature importances (for RF)
    if hasattr(model, "feature_importances_"):
        importances = pd.Series(model.feature_importances_, index=X.columns).sort_values(ascending=False)
        print("\nTop 10 Feature Importances:")
        print(importances.head(10))

    # Save artifacts
    model_path = Path(args.model_dir) / f"proxy_model_{args.model_type}.pkl"
    scaler_path = Path(args.model_dir) / "proxy_scaler.pkl"
    meta_path = Path(args.model_dir) / "proxy_meta.json"

    os.makedirs(args.model_dir, exist_ok=True)
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)

    meta = {
        "model_type": args.model_type,
        "features": list(X.columns),
        "scaler": "StandardScaler",
        "trained_at": datetime.utcnow().isoformat(),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "roc_auc": float(roc_auc_score(y_test, y_proba)),
    }
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"[INFO] Model saved to {model_path}")
    print(f"[INFO] Scaler saved to {scaler_path}")
    print(f"[INFO] Metadata saved to {meta_path}")

    return model, scaler, meta


if __name__ == "__main__":
    args = parse_args()
    df_raw = load_data(args.data)
    df = feature_engineering(df_raw)
    train_model(df, args)
