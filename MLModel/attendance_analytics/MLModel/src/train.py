import argparse
import json
from datetime import datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, f1_score, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def build_preprocessor(feature_df: pd.DataFrame) -> ColumnTransformer:
    numeric_cols = feature_df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = [c for c in feature_df.columns if c not in numeric_cols]

    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    return ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, numeric_cols),
            ("cat", categorical_pipeline, categorical_cols),
        ],
        remainder="drop",
    )


def infer_task(y: pd.Series) -> str:
    if pd.api.types.is_numeric_dtype(y):
        unique = y.dropna().unique()
        if len(unique) <= 20 and set(unique).issubset({0, 1}):
            return "classification"
        return "regression"
    return "classification"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True, help="Path to CSV dataset")
    parser.add_argument("--target", required=True, help="Target column name")
    parser.add_argument("--task", choices=["classification", "regression"], default=None)
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--random-state", type=int, default=42)
    parser.add_argument("--out-dir", default="models")
    args = parser.parse_args()

    data_path = Path(args.data)
    if not data_path.exists():
        raise FileNotFoundError(f"Dataset not found: {data_path}")

    df = pd.read_csv(data_path)
    if args.target not in df.columns:
        raise ValueError(f"Target column '{args.target}' not found in dataset columns")

    y = df[args.target]
    X = df.drop(columns=[args.target])

    task = args.task or infer_task(y)

    preprocessor = build_preprocessor(X)

    if task == "classification":
        model = RandomForestClassifier(
            n_estimators=300,
            random_state=args.random_state,
            n_jobs=-1,
        )
    else:
        model = RandomForestRegressor(
            n_estimators=400,
            random_state=args.random_state,
            n_jobs=-1,
        )

    pipeline = Pipeline(steps=[("preprocess", preprocessor), ("model", model)])

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=args.test_size,
        random_state=args.random_state,
        stratify=y if task == "classification" else None,
    )

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)

    metrics = {"task": task}
    if task == "classification":
        try:
            metrics["accuracy"] = float(accuracy_score(y_test, y_pred))
            metrics["f1_macro"] = float(f1_score(y_test, y_pred, average="macro"))
        except Exception:
            metrics["accuracy"] = None
            metrics["f1_macro"] = None
    else:
        rmse = float(mean_squared_error(y_test, y_pred, squared=False))
        metrics["rmse"] = rmse
        metrics["r2"] = float(r2_score(y_test, y_pred))

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    model_path = out_dir / "model.joblib"
    joblib.dump(pipeline, model_path)

    metadata = {
        "created_at": datetime.utcnow().isoformat() + "Z",
        "data": str(data_path.as_posix()),
        "target": args.target,
        "task": task,
        "features": X.columns.tolist(),
        "metrics": metrics,
        "model_path": str(model_path.as_posix()),
    }

    with (out_dir / "metadata.json").open("w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(json.dumps({"ok": True, **metrics, "model": str(model_path)}, indent=2))


if __name__ == "__main__":
    main()
