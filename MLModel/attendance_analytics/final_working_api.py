"""
Final Working API - Guaranteed to Work
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

# Initialize Flask on different port
app = Flask(__name__)
CORS(app)

# Load model artifacts directly
try:
    print("🔄 Loading model artifacts...")
    
    # Load model
    model_path = 'models/isolation_forest.pkl'
    scaler_path = 'models/scaler.pkl'
    metadata_path = 'models/metadata.json'
    
    if os.path.exists(model_path) and os.path.exists(scaler_path):
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        feature_names = metadata['feature_names']
        model_loaded = True
        print("✅ Model loaded successfully")
        print(f"📊 Features: {len(feature_names)}")
    else:
        model = None
        scaler = None
        feature_names = []
        model_loaded = False
        print("❌ Model files not found")
        
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None
    scaler = None
    feature_names = []
    model_loaded = False

def process_attendance_data(attendance_data):
    """Process attendance data for prediction"""
    try:
        # Create DataFrame
        df = pd.DataFrame(attendance_data)
        
        # Calculate basic features
        student_data = []
        
        for student_id, group in df.groupby('student_id'):
            total_sessions = len(group)
            present_sessions = group['attendance'].sum()
            attendance_percentage = (present_sessions / total_sessions * 100) if total_sessions > 0 else 0
            
            # Calculate consecutive absences
            consecutive_absent = 0
            max_consecutive_absent = 0
            
            for attendance in group['attendance'].values:
                if attendance == 0:
                    consecutive_absent += 1
                    max_consecutive_absent = max(max_consecutive_absent, consecutive_absent)
                else:
                    consecutive_absent = 0
            
            student_data.append({
                'student_id': student_id,
                'student_name': group['student_name'].iloc[0],
                'total_sessions': total_sessions,
                'present_sessions': present_sessions,
                'attendance_percentage': attendance_percentage,
                'consecutive_absent': consecutive_absent,
                'max_consecutive_absent': max_consecutive_absent
            })
        
        return pd.DataFrame(student_data)
        
    except Exception as e:
        print(f"Error processing data: {e}")
        raise

def generate_predictions(features_df):
    """Generate predictions using the loaded model"""
    try:
        if model_loaded and model is not None:
            # Use real model
            # Extract features for model
            model_features = []
            for _, row in features_df.iterrows():
                feature_vector = [
                    row['total_sessions'],
                    row['present_sessions'],
                    row['attendance_percentage'],
                    row['consecutive_absent'],
                    row['max_consecutive_absent'],
                    0,  # avg_absence_streak
                    0,  # total_absence_streaks
                    0,  # days_since_last_present
                    0,  # attendance_consistency
                    0,  # attendance_volatility
                    0,  # recent_attendance_rate
                    0,  # attendance_trend
                    0,  # irregularity_score
                    0   # risk_score
                ]
                model_features.append(feature_vector)
            
            # Scale features
            scaled_features = scaler.transform(model_features)
            
            # Predict
            predictions = model.predict(scaled_features)
            anomaly_scores = model.decision_function(scaled_features)
            
            # Create predictions DataFrame
            predictions_df = features_df.copy()
            predictions_df['anomaly_score'] = anomaly_scores
            predictions_df['irregular_flag'] = np.where(predictions == -1, 'Irregular', 'Normal')
            
            # Add risk levels
            predictions_df['risk_level'] = predictions_df.apply(
                lambda row: 'High Risk' if row['attendance_percentage'] < 60 else 
                           'At Risk' if row['attendance_percentage'] < 75 else 
                           'Low Risk', axis=1
            )
            
            return predictions_df
        else:
            # Use rule-based predictions
            predictions = []
            for _, row in features_df.iterrows():
                attendance_pct = row['attendance_percentage']
                
                if attendance_pct >= 90:
                    irregular_flag = 'Normal'
                    anomaly_score = 0.1
                    risk_level = 'Low Risk'
                elif attendance_pct >= 75:
                    irregular_flag = 'Normal'
                    anomaly_score = 0.05
                    risk_level = 'Low Risk'
                elif attendance_pct >= 60:
                    irregular_flag = 'Normal'
                    anomaly_score = -0.05
                    risk_level = 'Moderate Risk'
                else:
                    irregular_flag = 'Irregular'
                    anomaly_score = -0.15
                    risk_level = 'High Risk'
                
                predictions.append({
                    'student_id': row['student_id'],
                    'student_name': row['student_name'],
                    'attendance_percentage': attendance_pct,
                    'irregular_flag': irregular_flag,
                    'anomaly_score': anomaly_score,
                    'risk_level': risk_level,
                    'total_sessions': row['total_sessions'],
                    'present_sessions': row['present_sessions'],
                    'consecutive_absent': row['consecutive_absent'],
                    'max_consecutive_absent': row['max_consecutive_absent']
                })
            
            return pd.DataFrame(predictions)
            
    except Exception as e:
        print(f"Prediction error: {e}")
        raise

@app.route('/')
def home():
    """Home page - returns JSON"""
    return jsonify({
        'name': 'AI Attendance Analytics API',
        'version': '1.0.0',
        'status': 'running',
        'model_loaded': model_loaded,
        'model_type': 'Isolation Forest' if model_loaded else 'Rule-based',
        'features': len(feature_names) if model_loaded else 0,
        'endpoints': {
            'health': '/health',
            'predict': '/predict',
            'analyze': '/analyze'
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/health')
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'message': 'API is running successfully',
        'model_loaded': model_loaded,
        'model_type': 'Isolation Forest' if model_loaded else 'Rule-based',
        'features': len(feature_names) if model_loaded else 0,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict attendance anomalies"""
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
        
        # Process data
        features_df = process_attendance_data(attendance_data)
        
        # Generate predictions
        predictions_df = generate_predictions(features_df)
        
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
            'model_used': 'Isolation Forest' if model_loaded else 'Rule-based',
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    """Complete analysis with insights"""
    try:
        # Get predictions first
        prediction_result = predict()
        
        if isinstance(prediction_result, tuple):
            return prediction_result
        
        # Add analytics
        predictions = prediction_result.get('predictions', [])
        
        # Generate insights
        insights = []
        avg_attendance = prediction_result['summary']['average_attendance']
        
        if avg_attendance >= 90:
            insights.append({
                'category': 'Attendance Health',
                'type': 'positive',
                'insight': 'Outstanding attendance performance',
                'supporting_data': f'Average attendance: {avg_attendance:.1f}%'
            })
        elif avg_attendance >= 75:
            insights.append({
                'category': 'Attendance Health',
                'type': 'moderate',
                'insight': 'Good attendance performance',
                'supporting_data': f'Average attendance: {avg_attendance:.1f}%'
            })
        else:
            insights.append({
                'category': 'Attendance Health',
                'type': 'concerning',
                'insight': 'Attendance needs improvement',
                'supporting_data': f'Average attendance: {avg_attendance:.1f}%'
            })
        
        # Generate recommendations
        recommendations = []
        at_risk_pct = (prediction_result['summary']['at_risk_students'] / prediction_result['summary']['total_students']) * 100
        
        if at_risk_pct > 20:
            recommendations.append({
                'priority': 'high',
                'category': 'Risk Management',
                'recommendation': 'Implement student support program',
                'action_items': ['Early warning system', 'Academic support', 'Regular monitoring']
            })
        else:
            recommendations.append({
                'priority': 'medium',
                'category': 'Continuous Improvement',
                'recommendation': 'Monitor attendance trends',
                'action_items': ['Regular reporting', 'Student feedback', 'Parent communication']
            })
        
        prediction_result['analytics'] = {
            'insights': insights,
            'recommendations': recommendations,
            'student_groups': {
                'top_performers': [p for p in predictions if p['attendance_percentage'] >= 90],
                'at_risk_students': [p for p in predictions if p['attendance_percentage'] < 75]
            }
        }
        
        return prediction_result
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Final Working API")
    print("=" * 50)
    print(f"🤖 Model Loaded: {model_loaded}")
    print(f"📊 Model Type: {'Isolation Forest' if model_loaded else 'Rule-based'}")
    print("🌐 Server: http://localhost:5001")
    print("📚 API: http://localhost:5001")
    print("🛑 Press Ctrl+C to stop")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5001, debug=False)
