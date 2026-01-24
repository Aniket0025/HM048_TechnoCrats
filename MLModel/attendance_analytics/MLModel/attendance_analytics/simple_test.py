"""
Simple test for the API
"""

import requests
import json

def test_api():
    """Test the API endpoints"""
    base_url = "http://localhost:5000"
    
    print("🧪 Testing AI Attendance Analytics API")
    print("=" * 50)
    
    # Test home endpoint
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ Home endpoint: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   API Name: {data.get('name', 'Unknown')}")
            print(f"   Status: {data.get('status', 'Unknown')}")
            print(f"   Model Loaded: {data.get('model_loaded', False)}")
            if data.get('model_error'):
                print(f"   Model Error: {data['model_error']}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Home endpoint failed: {e}")
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        print(f"\n✅ Health endpoint: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Status: {data.get('status', 'Unknown')}")
            print(f"   Message: {data.get('message', 'Unknown')}")
            print(f"   Model Type: {data.get('model_type', 'Unknown')}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Health endpoint failed: {e}")
    
    # Test prediction endpoint
    try:
        test_data = {
            "data": [
                {"student_id": "STU001", "student_name": "John Doe", "session_date": "2024-01-01", "attendance": 1},
                {"student_id": "STU001", "student_name": "John Doe", "session_date": "2024-01-02", "attendance": 0},
                {"student_id": "STU002", "student_name": "Jane Smith", "session_date": "2024-01-01", "attendance": 1},
                {"student_id": "STU002", "student_name": "Jane Smith", "session_date": "2024-01-02", "attendance": 1}
            ]
        }
        
        response = requests.post(f"{base_url}/predict", json=test_data)
        print(f"\n✅ Prediction endpoint: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Status: {result.get('status', 'Unknown')}")
            summary = result.get('summary', {})
            print(f"   Total students: {summary.get('total_students', 0)}")
            print(f"   Anomalies detected: {summary.get('anomalies_detected', 0)}")
            print(f"   Average attendance: {summary.get('average_attendance', 0):.1f}%")
            
            # Show some predictions
            predictions = result.get('predictions', [])
            if predictions:
                print(f"   Sample predictions:")
                for pred in predictions[:2]:
                    print(f"     {pred.get('student_name')}: {pred.get('attendance_percentage', 0):.1f}% - {pred.get('irregular_flag', 'Unknown')}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Prediction endpoint failed: {e}")

if __name__ == "__main__":
    test_api()
