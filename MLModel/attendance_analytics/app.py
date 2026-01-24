"""
AI Attendance Analytics - Flask Web API
Host ML model as RESTful web service
"""

from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import sys
import json
from datetime import datetime
import logging

# Add src to path for imports
sys.path.append('src')
from feature_engineering import AttendanceFeatureEngineer
from prediction import AttendancePredictor
from analytics import AttendanceAnalytics
from report_generator import AttendanceReportGenerator

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for model components
feature_engineer = None
predictor = None
analytics_engine = None
report_generator = None
model_loaded = False

# HTML template for web interface
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Attendance Analytics API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header p {
            color: #7f8c8d;
            font-size: 1.2em;
        }
        .api-section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #3498db;
        }
        .api-section h3 {
            color: #2c3e50;
            margin-bottom: 15px;
        }
        .endpoint {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            border: 1px solid #e9ecef;
        }
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            margin-right: 10px;
        }
        .get { background: #28a745; }
        .post { background: #007bff; }
        .put { background: #ffc107; color: #000; }
        .delete { background: #dc3545; }
        .url {
            font-family: 'Courier New', monospace;
            background: #f1f3f4;
            padding: 5px 8px;
            border-radius: 4px;
        }
        .status {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .status.online {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.offline {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #2c3e50;
        }
        .form-group textarea {
            width: 100%;
            height: 150px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
        }
        .btn {
            background: #3498db;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        .btn:hover {
            background: #2980b9;
        }
        .response {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #dee2e6;
        }
        .response pre {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 AI Attendance Analytics API</h1>
            <p>Machine Learning Model for Attendance Pattern Analysis</p>
        </div>

        <div class="status" id="status">
            <h3>🔄 Checking Model Status...</h3>
        </div>

        <div class="api-section">
            <h3>📊 Available Endpoints</h3>
            
            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="url">/health</span>
                <p>Check API health and model status</p>
            </div>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="url">/model/info</span>
                <p>Get model information and statistics</p>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="url">/predict</span>
                <p>Predict attendance anomalies for student data</p>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="url">/analyze</span>
                <p>Complete analysis with insights and recommendations</p>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="url">/report</span>
                <p>Generate HTML report</p>
            </div>
        </div>

        <div class="api-section">
            <h3>🧪 Test API</h3>
            <div class="form-group">
                <label for="test-data">Test Data (JSON format):</label>
                <textarea id="test-data" placeholder='[
  {"student_id": "STU001", "student_name": "John Doe", "session_date": "2024-01-01", "attendance": 1},
  {"student_id": "STU001", "student_name": "John Doe", "session_date": "2024-01-02", "attendance": 0}
]'></textarea>
            </div>
            <button class="btn" onclick="testAPI()">Test Prediction</button>
            <div id="response" class="response" style="display: none;">
                <h4>Response:</h4>
                <pre id="response-content"></pre>
            </div>
        </div>
    </div>

    <script>
        // Check model status on page load
        fetch('/health')
            .then(response => response.json())
            .then(data => {
                const statusDiv = document.getElementById('status');
                if (data.status === 'healthy') {
                    statusDiv.className = 'status online';
                    statusDiv.innerHTML = '<h3>✅ Model is Online and Ready</h3><p>Students processed: ' + data.students_processed + '</p>';
                } else {
                    statusDiv.className = 'status offline';
                    statusDiv.innerHTML = '<h3>❌ Model is Offline</h3><p>' + data.message + '</p>';
                }
            })
            .catch(error => {
                const statusDiv = document.getElementById('status');
                statusDiv.className = 'status offline';
                statusDiv.innerHTML = '<h3>❌ Error connecting to API</h3><p>' + error.message + '</p>';
            });

        // Test API function
        function testAPI() {
            const testData = document.getElementById('test-data').value;
            const responseDiv = document.getElementById('response');
            const responseContent = document.getElementById('response-content');
            
            try {
                const data = JSON.parse(testData);
                
                fetch('/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        data: data,
                        return_analytics: true
                    })
                })
                .then(response => response.json())
                .then(data => {
                    responseDiv.style.display = 'block';
                    responseContent.textContent = JSON.stringify(data, null, 2);
                })
                .catch(error => {
                    responseDiv.style.display = 'block';
                    responseContent.textContent = 'Error: ' + error.message;
                });
            } catch (e) {
                responseDiv.style.display = 'block';
                responseContent.textContent = 'Invalid JSON: ' + e.message;
            }
        }
    </script>
</body>
</html>
"""

def load_model():
    """Load ML model components"""
    global feature_engineer, predictor, analytics_engine, report_generator, model_loaded
    
    try:
        logger.info("Loading ML model components...")
        
        # Initialize components
        feature_engineer = AttendanceFeatureEngineer()
        predictor = AttendancePredictor()
        analytics_engine = AttendanceAnalytics()
        report_generator = AttendanceReportGenerator()
        
        # Test model loading
        if predictor.load_model_artifacts():
            model_loaded = True
            logger.info("Model loaded successfully")
            return True
        else:
            logger.error("Failed to load model artifacts")
            return False
            
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False

def validate_attendance_data(data):
    """Validate attendance data format"""
    required_fields = ['student_id', 'student_name', 'session_date', 'attendance']
    
    if not isinstance(data, list):
        return False, "Data must be a list of attendance records"
    
    for record in data:
        if not isinstance(record, dict):
            return False, "Each record must be a dictionary"
        
        for field in required_fields:
            if field not in record:
                return False, f"Missing required field: {field}"
        
        # Validate attendance value
        if record['attendance'] not in [0, 1]:
            return False, "Attendance must be 0 (absent) or 1 (present)"
    
    return True, "Valid data format"

@app.route('/')
def home():
    """Home page with API documentation"""
    return render_template_string(HTML_TEMPLATE)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    if model_loaded and predictor:
        return jsonify({
            'status': 'healthy',
            'message': 'Model is ready for predictions',
            'timestamp': datetime.now().isoformat(),
            'model_type': 'IsolationForest',
            'students_processed': 'Ready for new data'
        })
    else:
        return jsonify({
            'status': 'unhealthy',
            'message': 'Model not loaded',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get model information"""
    if not model_loaded:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        info = predictor.get_model_info()
        return jsonify({
            'model_info': info,
            'feature_count': len(feature_engineer.feature_names) if feature_engineer else 0,
            'feature_names': feature_engineer.feature_names if feature_engineer else [],
            'api_version': '1.0.0',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Predict attendance anomalies"""
    if not model_loaded:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.get_json()
        
        if not data or 'data' not in data:
            return jsonify({'error': 'No data provided'}), 400
        
        attendance_data = data['data']
        return_analytics = data.get('return_analytics', False)
        
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
                'average_attendance': predictions_df['attendance_percentage'].mean(),
                'timestamp': datetime.now().isoformat()
            }
        }
        
        # Add analytics if requested
        if return_analytics:
            complete_analytics = analytics_engine.generate_complete_analytics(predictions_df)
            response['analytics'] = complete_analytics
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    """Complete analysis with insights and recommendations"""
    if not model_loaded:
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

@app.route('/report', methods=['POST'])
def generate_report():
    """Generate HTML report"""
    if not model_loaded:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.get_json()
        
        if not data or 'data' not in data:
            return jsonify({'error': 'No data provided'}), 400
        
        attendance_data = data['data']
        institute_info = data.get('institute_info', {
            'institute_name': 'Educational Institute',
            'department': 'Computer Science',
            'academic_year': '2024-2025',
            'division': 'A'
        })
        
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
        
        # Generate analytics
        complete_analytics = analytics_engine.generate_complete_analytics(predictions_df)
        
        # Generate HTML report
        output_dir = 'temp_reports'
        os.makedirs(output_dir, exist_ok=True)
        
        report_filename = f"attendance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        report_path = os.path.join(output_dir, report_filename)
        
        success = report_generator.generate_complete_report(
            complete_analytics,
            institute_info,
            output_dir
        )
        
        if success:
            return jsonify({
                'status': 'success',
                'report_path': report_path,
                'report_filename': report_filename,
                'analytics': complete_analytics,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'error': 'Failed to generate report'}), 500
        
    except Exception as e:
        logger.error(f"Report generation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# Add method to feature engineer for DataFrame input
def extract_features_from_dataframe(self, df):
    """Extract features from DataFrame instead of file"""
    # Preprocess data
    processed_df = self.preprocess_data(df)
    
    # Calculate features
    attendance_stats = self.calculate_attendance_percentage(processed_df)
    absence_patterns = self.calculate_absence_patterns(processed_df)
    behavioral_features = self.calculate_behavioral_features(processed_df)
    
    # Merge all features
    features_df = attendance_stats.merge(absence_patterns, on=['student_id', 'student_name'], how='left')
    features_df = features_df.merge(behavioral_features, on=['student_id', 'student_name'], how='left')
    
    # Fill missing values
    features_df = features_df.fillna(0)
    
    # Store feature names
    self.feature_names = [col for col in features_df.columns if col not in ['student_id', 'student_name']]
    
    return features_df

# Monkey patch the method
AttendanceFeatureEngineer.extract_features_from_dataframe = extract_features_from_dataframe

if __name__ == '__main__':
    # Load model before starting server
    if load_model():
        logger.info("Starting Flask server...")
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        logger.error("Failed to load model. Server not started.")
        print("❌ Failed to load ML model. Please check model files in 'models/' directory.")
