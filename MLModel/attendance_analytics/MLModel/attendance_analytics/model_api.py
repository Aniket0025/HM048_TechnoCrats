"""
ML Model API - Model Only Deployment
Deploy just the ML model as a service on Render
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import sys
import os
from datetime import datetime
import joblib
import json

# Add src to path
sys.path.append('src')

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Global model variables
model = None
scaler = None
metadata = None
model_loaded = False

def load_model():
    """Load ML model artifacts"""
    global model, scaler, metadata, model_loaded
    
    try:
        print("🔄 Loading ML model...")
        
        # Load model artifacts
        model_path = 'models/isolation_forest.pkl'
        scaler_path = 'models/scaler.pkl'
        metadata_path = 'models/metadata.json'
        
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            model = joblib.load(model_path)
            scaler = joblib.load(scaler_path)
            
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            
            model_loaded = True
            print("✅ ML model loaded successfully")
            return True
        else:
            print("❌ Model files not found")
            return False
            
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False

# Load model at startup
load_model()

def extract_features(attendance_data):
    """Extract features from attendance data"""
    try:
        # Create DataFrame
        df = pd.DataFrame(attendance_data)
        
        # Calculate features for each student
        student_features = []
        
        for student_id, group in df.groupby('student_id'):
            total_sessions = len(group)
            present_sessions = group['attendance'].sum()
            attendance_percentage = (present_sessions / total_sessions * 100) if total_sessions > 0 else 0
            
            # Calculate absence patterns
            consecutive_absent = 0
            max_consecutive_absent = 0
            
            for attendance in group['attendance'].values:
                if attendance == 0:
                    consecutive_absent += 1
                    max_consecutive_absent = max(max_consecutive_absent, consecutive_absent)
                else:
                    consecutive_absent = 0
            
            # Create feature vector (14 features)
            feature_vector = [
                total_sessions,                    # total_sessions
                present_sessions,                  # present_sessions
                attendance_percentage,             # attendance_percentage
                consecutive_absent,                # consecutive_absent
                max_consecutive_absent,            # max_consecutive_absent
                0,                                 # avg_absence_streak
                0,                                 # total_absence_streaks
                0,                                 # days_since_last_present
                0,                                 # attendance_consistency
                0,                                 # attendance_volatility
                0,                                 # recent_attendance_rate
                0,                                 # attendance_trend
                0,                                 # irregularity_score
                0                                  # risk_score
            ]
            
            student_features.append({
                'student_id': student_id,
                'student_name': group['student_name'].iloc[0],
                'features': feature_vector,
                'attendance_percentage': attendance_percentage
            })
        
        return student_features
        
    except Exception as e:
        print(f"Error extracting features: {e}")
        raise

def predict_anomalies(student_features):
    """Predict anomalies using the ML model"""
    try:
        if not model_loaded:
            raise Exception("Model not loaded")
        
        predictions = []
        
        for student in student_features:
            # Extract features
            features = np.array(student['features']).reshape(1, -1)
            
            # Scale features
            scaled_features = scaler.transform(features)
            
            # Predict
            prediction = model.predict(scaled_features)[0]
            anomaly_score = model.decision_function(scaled_features)[0]
            
            # Determine risk level
            attendance_pct = student['attendance_percentage']
            if attendance_pct >= 90:
                risk_level = 'Low Risk'
            elif attendance_pct >= 75:
                risk_level = 'Low Risk'
            elif attendance_pct >= 60:
                risk_level = 'Moderate Risk'
            else:
                risk_level = 'High Risk'
            
            predictions.append({
                'student_id': student['student_id'],
                'student_name': student['student_name'],
                'attendance_percentage': attendance_pct,
                'anomaly_prediction': int(prediction),
                'anomaly_score': float(anomaly_score),
                'is_irregular': 'Irregular' if prediction == -1 else 'Normal',
                'risk_level': risk_level
            })
        
        return predictions
        
    except Exception as e:
        print(f"Prediction error: {e}")
        raise

@app.route('/')
def home():
    """Model API home"""
    return jsonify({
        'name': 'AI Attendance Analytics - ML Model API',
        'version': '1.0.0',
        'status': 'running',
        'model_loaded': model_loaded,
        'model_type': 'Isolation Forest',
        'endpoints': {
            'health': '/health',
            'model_info': '/model/info',
            'predict': '/predict'
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/health')
def health():
    """Model health check"""
    return jsonify({
        'status': 'healthy' if model_loaded else 'unhealthy',
        'model_loaded': model_loaded,
        'model_type': 'Isolation Forest' if model_loaded else None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/model/info')
def model_info():
    """Get model information"""
    if not model_loaded:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({
        'model_type': 'Isolation Forest',
        'feature_count': len(metadata['feature_names']),
        'feature_names': metadata['feature_names'],
        'training_date': metadata['training_date'],
        'model_version': metadata.get('model_version', '1.0.0'),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict attendance anomalies"""
    try:
        if not model_loaded:
            return jsonify({'error': 'Model not loaded'}), 500
        
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
        
        # Extract features
        student_features = extract_features(attendance_data)
        
        # Make predictions
        predictions = predict_anomalies(student_features)
        
        # Calculate summary
        total_students = len(predictions)
        anomalies_detected = sum(1 for p in predictions if p['anomaly_prediction'] == -1)
        normal_patterns = total_students - anomalies_detected
        average_attendance = sum(p['attendance_percentage'] for p in predictions) / total_students
        at_risk_students = sum(1 for p in predictions if p['attendance_percentage'] < 75)
        
        return jsonify({
            'status': 'success',
            'predictions': predictions,
            'summary': {
                'total_students': total_students,
                'anomalies_detected': anomalies_detected,
                'normal_patterns': normal_patterns,
                'average_attendance': average_attendance,
                'at_risk_students': at_risk_students
            },
            'model_info': {
                'model_type': 'Isolation Forest',
                'feature_count': len(metadata['feature_names'])
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
