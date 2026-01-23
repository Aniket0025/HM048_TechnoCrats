#!/bin/bash
# Test prediction using the trained proxy model

set -e

cd "$(dirname "$0")/.."

echo "[INFO] Testing prediction with sample input..."
python src/predict.py --input "14,2,28.6139,77.2090,15.0,192,168,1,1,120,123"
echo
echo "[INFO] If you see a probability between 0 and 1, the model is working."
