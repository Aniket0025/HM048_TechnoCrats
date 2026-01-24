@echo off
REM Train proxy detection model (Windows)

setlocal

cd /d "%~dp0\.."

echo [INFO] Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo [INFO] Training proxy detection model...
python src\train_proxy.py ^
    --data data\proxy_training.csv ^
    --model-dir models ^
    --test-size 0.2 ^
    --random-state 42 ^
    --model-type rf

echo [INFO] Training complete. Model saved to models\
echo [INFO] You can now run predictions with:
echo   python src\predict.py --input "14,2,28.6139,77.2090,15.0,192,168,1,1,120,123"
