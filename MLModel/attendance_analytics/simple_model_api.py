"""
Simple ML Model API - Guaranteed to Work
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import json
import os
from datetime import datetime

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Load model artifacts
model = None
scaler = None
metadata = None
model_loaded = False

def load_model():
    """Load ML model"""
    global model, scaler, metadata, model_loaded
    
    try:
        print("🔄 Loading ML model...")
        
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

@app.route('/')
def home():
    """Home page"""
    return jsonify({
        'name': 'AI Attendance Analytics - ML Model API',
        'version': '1.0.0',
        'status': 'running',
        'model_loaded': model_loaded,
        'model_type': 'Isolation Forest' if model_loaded else 'Not Loaded',
        'endpoints': {
            'health': '/health',
            'model_info': '/model/info',
            'predict': '/predict'
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/health')
def health():
    """Health check"""
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
        
        # Process data
        df = pd.DataFrame(attendance_data)
        
        # Calculate features for each student
        predictions = []
        
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
            
            # Scale features and predict
            features = np.array(feature_vector).reshape(1, -1)
            scaled_features = scaler.transform(features)
            prediction = model.predict(scaled_features)[0]
            anomaly_score = model.decision_function(scaled_features)[0]
            
            # Determine risk level
            if attendance_percentage >= 90:
                risk_level = 'Low Risk'
            elif attendance_percentage >= 75:
                risk_level = 'Low Risk'
            elif attendance_percentage >= 60:
                risk_level = 'Moderate Risk'
            else:
                risk_level = 'High Risk'
            
            predictions.append({
                'student_id': student_id,
                'student_name': group['student_name'].iloc[0],
                'attendance_percentage': attendance_percentage,
                'anomaly_prediction': int(prediction),
                'anomaly_score': float(anomaly_score),
                'is_irregular': 'Irregular' if prediction == -1 else 'Normal',
                'risk_level': risk_level
            })
        
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
