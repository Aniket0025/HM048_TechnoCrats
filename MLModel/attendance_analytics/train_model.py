"""
Simple training script for attendance analytics
"""

import sys
sys.path.append('src')
from feature_engineering import AttendanceFeatureEngineer
from model_training import AttendanceModelTrainer
import pandas as pd
import os

def main():
    print('Step 1: Loading and preprocessing data...')
    engineer = AttendanceFeatureEngineer()
    features_df = engineer.extract_features('data/attendance_data.xlsx')

    print('Step 2: Training ML model...')
    trainer = AttendanceModelTrainer()
    results = trainer.train_complete_pipeline(features_df)

    print('Step 3: Saving training results...')
    print('Model trained successfully!')
    print('Total students processed:', results['sample_count'])
    print('Features extracted:', results['feature_count'])
    print('Model saved to:', results['model_path'])
    print('Scaler saved to:', results['scaler_path'])
    print('Metadata saved to:', results['metadata_path'])

    # Display evaluation metrics
    metrics = results['evaluation_metrics']
    print('\nModel Evaluation Metrics:')
    print('- Total samples:', metrics['total_samples'])
    print('- Anomalies detected:', metrics['anomalies_detected'])
    print('- Normal samples:', metrics['normal_samples'])
    print('- Anomaly rate: {:.2%}'.format(metrics['anomaly_rate']))

    print('\nTraining completed successfully!')

if __name__ == "__main__":
    main()
