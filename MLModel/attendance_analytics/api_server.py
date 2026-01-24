"""
Production-ready Flask API for AI Attendance Analytics
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import sys
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add src to path
sys.path.append('src')

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Model components (loaded at startup)
feature_engineer = None
predictor = None
analytics_engine = None
model_status = {"loaded": False, "error": None}

def load_models():
    """Load ML models at startup"""
    global feature_engineer, predictor, analytics_engine, model_status
    
    try:
        logger.info("Loading ML models...")
        
        # Import here to avoid issues if models aren't available
        from feature_engineering import AttendanceFeatureEngineer
        from prediction import AttendancePredictor
        from analytics import AttendanceAnalytics
        
        # Initialize components
        feature_engineer = AttendanceFeatureEngineer()
        predictor = AttendancePredictor()
        analytics_engine = AttendanceAnalytics()
        
        # Load model artifacts
        if predictor.load_model_artifacts():
            model_status["loaded"] = True
            logger.info("Models loaded successfully")
            return True
        else:
            model_status["error"] = "Failed to load model artifacts"
            logger.error("Failed to load model artifacts")
            return False
            
    except Exception as e:
        model_status["error"] = str(e)
        logger.error(f"Error loading models: {e}")
        return False

# Load models at startup
load_models()

def validate_attendance_data(data):
    """Validate attendance data"""
    if not isinstance(data, list):
        return False, "Data must be a list"
    
    required_fields = ['student_id', 'student_name', 'session_date', 'attendance']
    
    for i, record in enumerate(data):
        if not isinstance(record, dict):
            return False, f"Record {i} must be a dictionary"
        
        for field in required_fields:
            if field not in record:
                return False, f"Record {i} missing field: {field}"
        
        if record['attendance'] not in [0, 1]:
            return False, f"Record {i} attendance must be 0 or 1"
    
    return True, "Valid data"

@app.route('/')
def home():
    """API home page"""
    return jsonify({
        'name': 'AI Attendance Analytics API',
        'version': '1.0.0',
        'status': 'running',
        'model_loaded': model_status['loaded'],
        'endpoints': {
            'health': '/health',
            'model_info': '/model/info',
            'predict': '/predict',
            'analyze': '/analyze'
        },
        'documentation': 'https://github.com/your-repo/attendance-analytics'
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    if model_status['loaded']:
        return jsonify({
            'status': 'healthy',
            'message': 'ML model is ready for predictions',
            'timestamp': datetime.now().isoformat(),
            'model_type': 'IsolationForest',
            'features': len(feature_engineer.feature_names) if feature_engineer else 0
        })
    else:
        return jsonify({
            'status': 'unhealthy',
            'message': model_status.get('error', 'Model not loaded'),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/model/info')
def model_info():
    """Get model information"""
    if not model_status['loaded']:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        info = predictor.get_model_info()
        return jsonify({
            'model_info': info,
            'feature_count': len(feature_engineer.feature_names),
            'feature_names': feature_engineer.feature_names,
            'api_version': '1.0.0',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Predict attendance anomalies"""
    if not model_status['loaded']:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.get_json()
        
        if not data or 'data' not in data:
            return jsonify({'error': 'No data provided'}), 400
        
        attendance_data = data['data']
        
        # Validate data
        is_valid, message = validate_attendance_data(attendance_data)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Convert to DataFrame
        df = pd.DataFrame(attendance_data)
        
        # Extract features
        features_df = feature_engineer.extract_features_from_dataframe(df)
        
        # Generate predictions
        predictions_df = predictor.generate_predictions(features_df)
        
        # Prepare response
        response = {
            'status': 'success',
            'predictions': predictions_df.to_dict('records'),
            'summary': {
                'total_students': len(predictions_df),
                'anomalies_detected': predictions_df[predictions_df['irregular_flag'] == 'Irregular'].shape[0],
                'normal_patterns': predictions_df[predictions_df['irregular_flag'] == 'Normal'].shape[0],
                'average_attendance': float(predictions_df['attendance_percentage'].mean()),
                'at_risk_students': predictions_df[predictions_df['attendance_percentage'] < 75].shape[0]
            },
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    """Complete analysis with insights"""
    if not model_status['loaded']:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.get_json()
        
        if not data or 'data' not in data:
            return jsonify({'error': 'No data provided'}), 400
        
        attendance_data = data['data']
        
        # Validate data
        is_valid, message = validate_attendance_data(attendance_data)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Convert to DataFrame
        df = pd.DataFrame(attendance_data)
        
        # Extract features
        features_df = feature_engineer.extract_features_from_dataframe(df)
        
        # Generate predictions
        predictions_df = predictor.generate_predictions(features_df)
        
        # Generate complete analytics
        complete_analytics = analytics_engine.generate_complete_analytics(predictions_df)
        
        return jsonify({
            'status': 'success',
            'predictions': predictions_df.to_dict('records'),
            'analytics': complete_analytics,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# Add the method to feature engineer
def extract_features_from_dataframe(self, df):
    """Extract features from DataFrame"""
    try:
        # Preprocess data
        processed_df = self.preprocess_data(df)
        
        # Calculate features
        attendance_stats = self.calculate_attendance_percentage(processed_df)
        absence_patterns = self.calculate_absence_patterns(processed_df)
        behavioral_features = self.calculate_behavioral_features(processed_df)
        
        # Merge all features
        features_df = attendance_stats.merge(absence_patterns, on=['student_id', 'student_name'], how='left')
        features_df = features_df.merge(behavioral_features, on=['student_id', 'student_name'], how='left')
        features_df = features_df.fillna(0)
        
        # Store feature names
        self.feature_names = [col for col in features_df.columns if col not in ['student_id', 'student_name']]
        
        return features_df
    except Exception as e:
        logger.error(f"Feature extraction error: {e}")
        raise

# Monkey patch the method
from feature_engineering import AttendanceFeatureEngineer
AttendanceFeatureEngineer.extract_features_from_dataframe = extract_features_from_dataframe

if __name__ == '__main__':
    print("🚀 Starting AI Attendance Analytics API Server")
    print("=" * 60)
    
    if model_status['loaded']:
        print("✅ ML Models loaded successfully")
        print(f"📊 Features: {len(feature_engineer.feature_names)}")
        print(f"🤖 Model: Isolation Forest")
        print("🌐 Server starting on http://localhost:5000")
        print("📚 API Documentation: http://localhost:5000")
        print("🛑 Press Ctrl+C to stop")
        print("=" * 60)
        
        # Start server
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        print("❌ Failed to load ML models")
        print(f"Error: {model_status.get('error', 'Unknown error')}")
        print("🔧 Please check model files in 'models/' directory")
        sys.exit(1)
