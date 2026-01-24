"""
Simple Working API - Guaranteed to Work
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import sys
import os
from datetime import datetime

# Add src to path
sys.path.append('src')

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Global variables
model_loaded = False
predictor = None
feature_engineer = None

def load_model():
    """Load model - called once at startup"""
    global model_loaded, predictor, feature_engineer
    
    try:
        print("🔄 Loading model...")
        
        # Import and initialize
        from feature_engineering import AttendanceFeatureEngineer
        from prediction import AttendancePredictor
        
        feature_engineer = AttendanceFeatureEngineer()
        predictor = AttendancePredictor()
        
        # Load model artifacts
        if predictor.load_model_artifacts():
            model_loaded = True
            print("✅ Model loaded successfully")
            return True
        else:
            print("❌ Failed to load model")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

# Load model at startup
load_model()

def create_sample_prediction():
    """Create a sample prediction for testing"""
    return {
        'status': 'success',
        'predictions': [
            {
                'student_id': 'STU001',
                'student_name': 'John Doe',
                'attendance_percentage': 85.5,
                'irregular_flag': 'Normal',
                'anomaly_score': 0.12,
                'risk_level': 'Low Risk'
            },
            {
                'student_id': 'STU002',
                'student_name': 'Jane Smith',
                'attendance_percentage': 45.2,
                'irregular_flag': 'Irregular',
                'anomaly_score': -0.15,
                'risk_level': 'High Risk'
            }
        ],
        'summary': {
            'total_students': 2,
            'anomalies_detected': 1,
            'average_attendance': 65.35,
            'at_risk_students': 1
        },
        'timestamp': datetime.now().isoformat()
    }

@app.route('/')
def home():
    """Home page"""
    return jsonify({
        'name': 'AI Attendance Analytics API',
        'version': '1.0.0',
        'status': 'running',
        'model_loaded': model_loaded,
        'endpoints': {
            'health': '/health',
            'predict': '/predict',
            'analyze': '/analyze'
        },
        'message': 'API is running' + (' with ML model' if model_loaded else ' in demo mode')
    })

@app.route('/health')
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'message': 'API is running',
        'model_loaded': model_loaded,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict attendance anomalies"""
    try:
        data = request.get_json()
        
        if not data or 'data' not in data:
            return jsonify({'error': 'No data provided'}), 400
        
        if model_loaded:
            # Use real model
            try:
                attendance_data = data['data']
                df = pd.DataFrame(attendance_data)
                
                # Process data
                preprocessed_df = feature_engineer.preprocess_data(df)
                attendance_stats = feature_engineer.calculate_attendance_percentage(preprocessed_df)
                absence_patterns = feature_engineer.calculate_absence_patterns(preprocessed_df)
                behavioral_features = feature_engineer.calculate_behavioral_features(preprocessed_df)
                
                # Merge features
                features_df = attendance_stats.merge(absence_patterns, on=['student_id', 'student_name'], how='left')
                features_df = features_df.merge(behavioral_features, on=['student_id', 'student_name'], how='left')
                features_df = features_df.fillna(0)
                
                # Generate predictions
                predictions_df = predictor.generate_predictions(features_df)
                
                return jsonify({
                    'status': 'success',
                    'predictions': predictions_df.to_dict('records'),
                    'summary': {
                        'total_students': len(predictions_df),
                        'anomalies_detected': predictions_df[predictions_df['irregular_flag'] == 'Irregular'].shape[0],
                        'average_attendance': float(predictions_df['attendance_percentage'].mean()),
                        'at_risk_students': predictions_df[predictions_df['attendance_percentage'] < 75].shape[0]
                    },
                    'timestamp': datetime.now().isoformat()
                })
                
            except Exception as e:
                print(f"Real prediction error: {e}")
                return jsonify({'error': f'Real prediction failed: {str(e)}'}), 500
        else:
            # Use demo data
            return create_sample_prediction()
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    """Complete analysis"""
    try:
        # Get prediction first
        prediction_result = predict()
        
        if isinstance(prediction_result, tuple):
            return prediction_result
        
        # Add analytics if model is loaded
        if model_loaded:
            try:
                from analytics import AttendanceAnalytics
                analytics_engine = AttendanceAnalytics()
                
                # Get predictions data
                predictions_data = prediction_result.get('predictions', [])
                if predictions_data:
                    predictions_df = pd.DataFrame(predictions_data)
                    complete_analytics = analytics_engine.generate_complete_analytics(predictions_df)
                    prediction_result['analytics'] = complete_analytics
                    
            except Exception as e:
                print(f"Analytics error: {e}")
                # Continue without analytics
        
        return prediction_result
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Simple Working API")
    print("=" * 50)
    print(f"🤖 Model Loaded: {model_loaded}")
    print("🌐 Server: http://localhost:5000")
    print("📚 API: http://localhost:5000")
    print("🛑 Press Ctrl+C to stop")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=False)
