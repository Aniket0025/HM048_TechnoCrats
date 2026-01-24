# Quick Start – Proxy Detection ML Model

## 1️⃣ Train the model (one‑time)

### Windows
```cmd
scripts\train_proxy_only.bat
```

### Linux/macOS
```bash
chmod +x scripts/train_proxy_only.sh
./scripts/train_proxy_only.sh
```

This creates:
- `models/proxy_model_rf.pkl`
- `models/proxy_scaler.pkl`
- `models/proxy_meta.json`

## 2️⃣ Test prediction

### Windows
```cmd
scripts\test_predict.bat
```

### Linux/macOS
```bash
chmod +x scripts/test_predict.sh
./scripts/test_predict.sh
```

You should see a probability like `0.1234`.

## 3️⃣ Backend integration

The backend already calls `python src/predict.py --input "<features>"` and reads the probability.
If the model files exist, it uses the trained model; otherwise it falls back to a simple heuristic.

## 4️⃣ (Optional) Use your own data

Replace `data/proxy_training.csv` with a CSV containing:

```
hour_of_day,day_of_week,gps_lat,gps_lng,gps_accuracy,ip_octet1,ip_octet2,ip_octet3,ip_octet4,ua_length,fp_hash,label
```

Then re‑run step 1.

---

**That’s it!** Your proxy detection is now powered by a real ML model.
