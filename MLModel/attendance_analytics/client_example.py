"""
Client example for AI Attendance Analytics API
Demonstrates how to use the hosted ML model
"""

import requests
import json
import pandas as pd
from datetime import datetime

class AttendanceAnalyticsClient:
    """Client for interacting with Attendance Analytics API"""
    
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def health_check(self):
        """Check API health status"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
    
    def get_model_info(self):
        """Get model information"""
        try:
            response = self.session.get(f"{self.base_url}/model/info")
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
    
    def predict(self, attendance_data, return_analytics=False):
        """
        Predict attendance anomalies
        
        Args:
            attendance_data: List of attendance records
            return_analytics: Whether to include analytics in response
        
        Returns:
            Prediction results
        """
        try:
            payload = {
                "data": attendance_data,
                "return_analytics": return_analytics
            }
            
            response = self.session.post(
                f"{self.base_url}/predict",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
    
    def analyze(self, attendance_data):
        """
        Complete analysis with insights and recommendations
        
        Args:
            attendance_data: List of attendance records
        
        Returns:
            Complete analysis results
        """
        try:
            payload = {"data": attendance_data}
            
            response = self.session.post(
                f"{self.base_url}/analyze",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
    
    def generate_report(self, attendance_data, institute_info=None):
        """
        Generate HTML report
        
        Args:
            attendance_data: List of attendance records
            institute_info: Institute information dictionary
        
        Returns:
            Report generation results
        """
        try:
            payload = {
                "data": attendance_data,
                "institute_info": institute_info or {
                    "institute_name": "Educational Institute",
                    "department": "Computer Science",
                    "academic_year": "2024-2025",
                    "division": "A"
                }
            }
            
            response = self.session.post(
                f"{self.base_url}/report",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}

def create_sample_data():
    """Create sample attendance data for testing"""
    return [
        {"student_id": "STU001", "student_name": "John Doe", "session_date": "2024-01-01", "attendance": 1},
        {"student_id": "STU001", "student_name": "John Doe", "session_date": "2024-01-02", "attendance": 1},
        {"student_id": "STU001", "student_name": "John Doe", "session_date": "2024-01-03", "attendance": 0},
        {"student_id": "STU001", "student_name": "John Doe", "session_date": "2024-01-04", "attendance": 1},
        {"student_id": "STU001", "student_name": "John Doe", "session_date": "2024-01-05", "attendance": 0},
        
        {"student_id": "STU002", "student_name": "Jane Smith", "session_date": "2024-01-01", "attendance": 1},
        {"student_id": "STU002", "student_name": "Jane Smith", "session_date": "2024-01-02", "attendance": 1},
        {"student_id": "STU002", "student_name": "Jane Smith", "session_date": "2024-01-03", "attendance": 1},
        {"student_id": "STU002", "student_name": "Jane Smith", "session_date": "2024-01-04", "attendance": 1},
        {"student_id": "STU002", "student_name": "Jane Smith", "session_date": "2024-01-05", "attendance": 1},
        
        {"student_id": "STU003", "student_name": "Bob Johnson", "session_date": "2024-01-01", "attendance": 0},
        {"student_id": "STU003", "student_name": "Bob Johnson", "session_date": "2024-01-02", "attendance": 0},
        {"student_id": "STU003", "student_name": "Bob Johnson", "session_date": "2024-01-03", "attendance": 0},
        {"student_id": "STU003", "student_name": "Bob Johnson", "session_date": "2024-01-04", "attendance": 0},
        {"student_id": "STU003", "student_name": "Bob Johnson", "session_date": "2024-01-05", "attendance": 0},
    ]

def main():
    """Demonstrate API usage"""
    print("🎯 AI Attendance Analytics API - Client Example")
    print("=" * 60)
    
    # Initialize client
    client = AttendanceAnalyticsClient()
    
    # Check API health
    print("🔍 Checking API health...")
    health = client.health_check()
    if "error" in health:
        print(f"❌ API is not available: {health['error']}")
        print("💡 Make sure the API server is running: python start_api.py")
        return
    
    print("✅ API is healthy!")
    print(f"📊 Status: {health.get('status')}")
    print(f"🤖 Model: {health.get('model_type')}")
    
    # Get model info
    print("\n🤖 Getting model information...")
    model_info = client.get_model_info()
    if "error" not in model_info:
        print(f"📊 Features: {model_info.get('feature_count', 'Unknown')}")
        print(f"🔢 Feature names: {model_info.get('feature_names', [])[:3]}...")
    
    # Create sample data
    print("\n📊 Creating sample attendance data...")
    sample_data = create_sample_data()
    print(f"📋 Created {len(sample_data)} attendance records")
    
    # Test prediction
    print("\n🔮 Testing prediction endpoint...")
    prediction_result = client.predict(sample_data, return_analytics=True)
    
    if "error" not in prediction_result:
        print("✅ Prediction successful!")
        summary = prediction_result.get('summary', {})
        print(f"👥 Total students: {summary.get('total_students', 0)}")
        print(f"🚨 Anomalies detected: {summary.get('anomalies_detected', 0)}")
        print(f"📈 Average attendance: {summary.get('average_attendance', 0):.1f}%")
        
        # Show some predictions
        predictions = prediction_result.get('predictions', [])
        if predictions:
            print("\n📋 Sample predictions:")
            for pred in predictions[:3]:
                print(f"  {pred.get('student_name')}: {pred.get('attendance_percentage', 0):.1f}% - {pred.get('irregular_flag', 'Unknown')}")
    else:
        print(f"❌ Prediction failed: {prediction_result['error']}")
    
    # Test complete analysis
    print("\n📊 Testing complete analysis...")
    analysis_result = client.analyze(sample_data)
    
    if "error" not in analysis_result:
        print("✅ Analysis successful!")
        analytics = analysis_result.get('analytics', {})
        
        # Show insights
        insights = analytics.get('insights', [])
        if insights:
            print("\n🤖 Key insights:")
            for insight in insights[:2]:
                print(f"  • {insight.get('category', 'Unknown')}: {insight.get('insight', 'No insight')}")
        
        # Show recommendations
        recommendations = analytics.get('recommendations', [])
        if recommendations:
            print("\n🎯 Top recommendations:")
            for rec in recommendations[:2]:
                print(f"  • {rec.get('recommendation', 'No recommendation')} ({rec.get('priority', 'Unknown')} priority)")
    else:
        print(f"❌ Analysis failed: {analysis_result['error']}")
    
    # Test report generation
    print("\n📄 Testing report generation...")
    institute_info = {
        "institute_name": "Demo Institute",
        "department": "Computer Science",
        "academic_year": "2024-2025",
        "division": "A"
    }
    
    report_result = client.generate_report(sample_data, institute_info)
    
    if "error" not in report_result:
        print("✅ Report generated successfully!")
        print(f"📄 Report file: {report_result.get('report_filename', 'Unknown')}")
    else:
        print(f"❌ Report generation failed: {report_result['error']}")
    
    print("\n" + "=" * 60)
    print("🎉 API client example completed successfully!")
    print("💡 You can now integrate this client into your applications")

if __name__ == "__main__":
    main()
