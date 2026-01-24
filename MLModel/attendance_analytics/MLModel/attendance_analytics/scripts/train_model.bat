@echo off
echo ========================================
echo AI Attendance Analytics - Model Training
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if required packages are installed
echo Checking required packages...
python -c "import pandas, numpy, sklearn" >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install required packages
        pause
        exit /b 1
    )
)

REM Check if data directory exists
if not exist "data" (
    echo Creating data directory...
    mkdir data
    echo Please place your attendance Excel file in the data folder
    echo File should be named: attendance_data.xlsx
    pause
    exit /b 1
)

REM Check if attendance data file exists
if not exist "data\attendance_data.xlsx" (
    echo ERROR: attendance_data.xlsx not found in data folder
    echo Please place your attendance Excel file in the data folder
    pause
    exit /b 1
)

REM Run the training script
echo.
echo Starting model training...
echo.

python -c "
import sys
sys.path.append('src')
from feature_engineering import AttendanceFeatureEngineer
from model_training import AttendanceModelTrainer
import pandas as pd
import os

print('Step 1: Loading and preprocessing data...')
engineer = AttendanceFeatureEngineer()
features_df = engineer.extract_features('data/attendance_data.xlsx')

print('Step 2: Training ML model...')
trainer = AttendanceModelTrainer()
results = trainer.train_complete_pipeline(features_df)

print('Step 3: Saving training results...')
print(f'Model trained successfully!')
print(f'Total students processed: {results[\"sample_count\"]}')
print(f'Features extracted: {results[\"feature_count\"]}')
print(f'Model saved to: {results[\"model_path\"]}')
print(f'Scaler saved to: {results[\"scaler_path\"]}')
print(f'Metadata saved to: {results[\"metadata_path\"]}')

# Display evaluation metrics
metrics = results['evaluation_metrics']
print(f'\\nModel Evaluation Metrics:')
print(f'- Total samples: {metrics[\"total_samples\"]}')
print(f'- Anomalies detected: {metrics[\"anomalies_detected\"]}')
print(f'- Normal samples: {metrics[\"normal_samples\"]}')
print(f'- Anomaly rate: {metrics[\"anomaly_rate\"]:.2%}')

print('\\nTraining completed successfully!')
"

if errorlevel 1 (
    echo ERROR: Model training failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Model Training Completed Successfully!
echo ========================================
echo.
echo Model artifacts saved in 'models' folder:
echo - isolation_forest.pkl (trained model)
echo - scaler.pkl (feature scaler)
echo - metadata.json (model metadata)
echo.
echo You can now run the analysis script to generate predictions and reports.
echo.
pause
