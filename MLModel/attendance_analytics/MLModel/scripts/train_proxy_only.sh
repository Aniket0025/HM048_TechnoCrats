#!/bin/bash
# Train proxy detection model (Unix) – minimal

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "[INFO] Installing dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "[INFO] Training proxy detection model..."
python src/train_proxy_only.py \
    --data data/proxy_training.csv \
    --model-dir models \
    --test-size 0.2 \
    --random-state 42 \
    --model-type rf

echo
echo "[INFO] Training complete. Model saved to models/"
echo "[INFO] Backend will now use the trained model for proxy detection."
