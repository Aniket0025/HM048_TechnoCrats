import argparse
from pathlib import Path

import joblib
import pandas as pd


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True, help="Path to saved model.joblib")
    parser.add_argument("--data", required=True, help="Path to CSV file to predict on")
    parser.add_argument("--out", default=None, help="Output CSV path (default: print first rows)")
    args = parser.parse_args()

    model_path = Path(args.model)
    data_path = Path(args.data)

    if not model_path.exists():
        raise FileNotFoundError(f"Model not found: {model_path}")
    if not data_path.exists():
        raise FileNotFoundError(f"Data not found: {data_path}")

    pipeline = joblib.load(model_path)
    df = pd.read_csv(data_path)

    preds = pipeline.predict(df)
    out_df = df.copy()
    out_df["prediction"] = preds

    if args.out:
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_df.to_csv(out_path, index=False)
        print(f"Saved predictions to: {out_path}")
    else:
        print(out_df.head(10).to_string(index=False))


if __name__ == "__main__":
    main()
