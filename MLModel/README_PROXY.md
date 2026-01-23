# MLModel – Proxy Detection

This folder contains a lightweight ML pipeline to detect proxy/attendance anomalies.

## Quick Start (Windows)

```bash
# From the MLModel folder:
scripts\train_proxy.bat
```

## Quick Start (Linux/macOS)

```bash
# From the MLModel folder:
chmod +x scripts/train_proxy.sh
./scripts/train_proxy.sh
```

## What it does

- **Training**: `src/train_proxy.py` trains a RandomForest on historical attendance data with features:
  - Time of day, day of week
  - GPS latitude/longitude, accuracy
  - IP octets (private/public)
  - User‑agent length
  - Device fingerprint hash
  - Derived features: distance from reference, night/weekend flags, poor GPS flag
- **Prediction**: `src/predict.py` loads the trained model and returns a proxy probability (0–1). Falls back to a heuristic if the model is missing.

## Data format

If you have real data, place a CSV at `data/proxy_training.csv` with columns:

```
hour_of_day,day_of_week,gps_lat,gps_lng,gps_accuracy,ip_octet1,ip_octet2,ip_octet3,ip_octet4,ua_length,fp_hash,label
```

- `label`: 1 for proxy, 0 for legitimate.
- The script will generate a dummy dataset for demonstration if none exists.

## Model artifacts

After training, the `models/` folder contains:
- `proxy_model_rf.pkl`: trained RandomForest
- `proxy_scaler.pkl`: StandardScaler
- `proxy_meta.json`: feature list and metadata

## Usage from Backend

The backend calls:

```bash
python src/predict.py --input "14,2,28.6139,77.2090,15.0,192,168,1,1,120,123"
```

and reads the probability from stdout.

## Requirements

- Python 3.11+ (64‑bit recommended on Windows)
- See `requirements.txt` (numpy, pandas, scikit‑learn, joblib)

## Tips

- Replace the dummy dataset with real labeled data for better accuracy.
- Adjust `train_proxy.py` hyperparameters or try `--model-type lr` for LogisticRegression.
- The reference point for distance is hardcoded to Delhi (28.6139, 77.2090); update it in the scripts if needed.
