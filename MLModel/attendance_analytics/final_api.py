"""
Final Working Flask API for Attendance Analytics
Simple and reliable implementation
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

# Global cache for model components
_model_cache = {}

def get_model_components():
    """Get or load model components"""
    if 'predictor' not in _model_cache:
        try:
            logger.info("Loading model components...")
            
            from feature_engineering import AttendanceFeatureEngineer
            from prediction import AttendancePredictor
            from analytics import AttendanceAnalytics
            
            # Initialize components
            feature_engineer = AttendanceFeatureEngineer()
            predictor = AttendancePredictor()
            analytics_engine = AttendanceAnalytics()
            
            # Load model artifacts
            if predictor.load_model_artifacts():
                _model_cache['feature_engineer'] = feature_engineer
                _model_cache['predictor'] = predictor
                _model_cache['analytics_engine'] = analytics_engine
                _model_cache['loaded'] = True
                logger.info("Models loaded successfully")
            else:
                _model_cache['loaded'] = False
                _model_cache['error'] = "Failed to load model artifacts"
                
        except Exception as e:
            _model_cache['loaded'] = False
            _model_cache['error'] = str(e)
            logger.error(f"Error loading models: {e}")
    
    return _model_cache

def process_attendance_data(attendance_data):
    """Process attendance data and extract features"""
    components = get_model_components()
    
    if not components.get('loaded'):
        raise Exception("Model not loaded")
    
    feature_engineer = components['feature_engineer']
    
    # Create DataFrame
    df = pd.DataFrame(attendance_data)
    
    # Process data using existing methods
    preprocessed_df = feature_engineer.preprocess_data(df)
    
    # Calculate features
    attendance_stats = feature_engineer.calculate_attendance_percentage(preprocessed_df)
    absence_patterns = feature_engineer.calculate_absence_patterns(preprocessed_df)
    behavioral_features = feature_engineer.calculate_behavioral_features(preprocessed_df)
    
    # Merge features
    features_df = attendance_stats.merge(absence_patterns, on=['student_id', 'student_name'], how='left')
    features_df = features_df.merge(behavioral_features, on=['student_id', 'student_name'], how='left')
    features_df = features_df.fillna(0)
    
    return features_df

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
    components = get_model_components()
    
    return jsonify({
        'name': 'AI Attendance Analytics API',
        'version': '1.0.0',
        'status': 'running',
        'model_loaded': components.get('loaded', False),
        'model_error': components.get('error'),
        'endpoints': {
            'health': '/health',
            'model_info': '/model/info',
            'predict': '/predict',
            'analyze': '/analyze'
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    components = get_model_components()
    
    if components.get('loaded'):
        feature_engineer = components['feature_engineer']
        predictor = components['predictor']
        
        return jsonify({
            'status': 'healthy',
            'message': 'ML model is ready for predictions',
            'timestamp': datetime.now().isoformat(),
            'model_type': 'IsolationForest',
            'features': len(feature_engineer.feature_names) if feature_engineer else 0,
            'model_info': predictor.get_model_info() if predictor else {}
        })
    else:
        return jsonify({
            'status': 'unhealthy',
            'message': components.get('error', 'Model not loaded'),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/model/info')
def model_info():
    """Get model information"""
    components = get_model_components()
    
    if not components.get('loaded'):
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        predictor = components['predictor']
        feature_engineer = components['feature_engineer']
        
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
    components = get_model_components()
    
    if not components.get('loaded'):
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
        
        # Process data and extract features
        features_df = process_attendance_data(attendance_data)
        
        # Generate predictions
        predictor = components['predictor']
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
    components = get_model_components()
    
    if not components.get('loaded'):
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
        
        # Process data and extract features
        features_df = process_attendance_data(attendance_data)
        
        # Generate predictions
        predictor = components['predictor']
        predictions_df = predictor.generate_predictions(features_df)
        
        # Generate complete analytics
        analytics_engine = components['analytics_engine']
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

if __name__ == '__main__':
    print("🚀 Starting AI Attendance Analytics API Server")
    print("=" * 60)
    print("🌐 Server starting on http://localhost:5000")
    print("📚 API Documentation: http://localhost:5000")
    print("🛑 Press Ctrl+C to stop")
    print("=" * 60)
    
    # Start server
    app.run(host='0.0.0.0', port=5000, debug=False)
