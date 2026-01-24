"""
Simple Flask API for Attendance Analytics
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import sys
import os
from datetime import datetime

# Add src to path
sys.path.append('src')
from feature_engineering import AttendanceFeatureEngineer
from prediction import AttendancePredictor
from analytics import AttendanceAnalytics

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Global variables
feature_engineer = None
predictor = None
analytics_engine = None

def initialize_model():
    """Initialize model components"""
    global feature_engineer, predictor, analytics_engine
    
    try:
        print("🔄 Initializing model components...")
        
        feature_engineer = AttendanceFeatureEngineer()
        predictor = AttendancePredictor()
        analytics_engine = AttendanceAnalytics()
        
        # Test model loading
        if predictor.load_model_artifacts():
            print("✅ Model loaded successfully")
            return True
        else:
            print("❌ Failed to load model")
            return False
            
    except Exception as e:
        print(f"❌ Error initializing model: {e}")
        return False

@app.route('/')
def home():
    """Home page"""
    return jsonify({
        'message': 'AI Attendance Analytics API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'health': '/health',
            'predict': '/predict',
            'analyze': '/analyze'
        }
    })

@app.route('/health')
def health():
    """Health check"""
    if predictor and hasattr(predictor, 'model'):
        return jsonify({
            'status': 'healthy',
            'message': 'Model is ready',
            'timestamp': datetime.now().isoformat(),
            'model_type': 'IsolationForest'
        })
    else:
        return jsonify({
            'status': 'unhealthy',
            'message': 'Model not loaded',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Predict anomalies"""
    if not predictor:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.get_json()
        if not data or 'data' not in data:
            return jsonify({'error': 'No data provided'}), 400
        
        attendance_data = data['data']
        
        # Validate data
        required_fields = ['student_id', 'student_name', 'session_date', 'attendance']
        for record in attendance_data:
            for field in required_fields:
                if field not in record:
                    return jsonify({'error': f'Missing field: {field}'}), 400
        
        # Convert to DataFrame
        df = pd.DataFrame(attendance_data)
        
        # Extract features
        features_df = feature_engineer.extract_features_from_dataframe(df)
        
        # Generate predictions
        predictions_df = predictor.generate_predictions(features_df)
        
        return jsonify({
            'status': 'success',
            'predictions': predictions_df.to_dict('records'),
            'summary': {
                'total_students': len(predictions_df),
                'anomalies_detected': predictions_df[predictions_df['irregular_flag'] == 'Irregular'].shape[0],
                'average_attendance': predictions_df['attendance_percentage'].mean()
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add the method to feature engineer
def extract_features_from_dataframe(self, df):
    """Extract features from DataFrame"""
    processed_df = self.preprocess_data(df)
    attendance_stats = self.calculate_attendance_percentage(processed_df)
    absence_patterns = self.calculate_absence_patterns(processed_df)
    behavioral_features = self.calculate_behavioral_features(processed_df)
    
    features_df = attendance_stats.merge(absence_patterns, on=['student_id', 'student_name'], how='left')
    features_df = features_df.merge(behavioral_features, on=['student_id', 'student_name'], how='left')
    features_df = features_df.fillna(0)
    
    self.feature_names = [col for col in features_df.columns if col not in ['student_id', 'student_name']]
    return features_df

# Monkey patch
AttendanceFeatureEngineer.extract_features_from_dataframe = extract_features_from_dataframe

if __name__ == '__main__':
    print("🚀 Starting Simple AI Attendance Analytics API...")
    
    if initialize_model():
        print("✅ Model initialized successfully")
        print("🌐 Starting server on http://localhost:5000")
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        print("❌ Failed to initialize model")
