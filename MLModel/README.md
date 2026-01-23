# MLModel

This folder contains a runnable, minimal ML pipeline (tabular CSV) with:

- training: `src/train.py`
- inference: `src/predict.py`
- saved artifacts: `models/`

## Setup

```bash
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### If installation fails on Windows (NumPy tries to build)

If you see errors like `Unknown compiler(s)` / `cl not found` / `vswhere.exe` missing, `pip` is trying to compile NumPy from source (no prebuilt wheel for your Python).

1) Check your Python version:

```bash
python --version
```

2) Recommended:

- Use **Python 3.11 or 3.12 (64-bit)** for easiest installs.

3) Recreate the venv after changing Python:

```bash
deactivate
Remove-Item -Recurse -Force .venv
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

## Data format

Provide a CSV file with a header row.

- One column is your **target** (label)
- All other columns are treated as features

## Train

```bash
python src/train.py --data data/dataset.csv --target target_column
```

Outputs:

- `models/model.joblib`
- `models/metadata.json`

## Predict

```bash
python src/predict.py --model models/model.joblib --data data/dataset.csv --out predictions.csv
```

The output file will include a `prediction` column.
