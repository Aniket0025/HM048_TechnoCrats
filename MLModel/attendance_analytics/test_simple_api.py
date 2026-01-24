"""
Test the simple API
"""

import requests
import json

def test_api():
    """Test API endpoints"""
    base_url = "http://localhost:5000"
    
    print("🧪 Testing AI Attendance Analytics API")
    print("=" * 50)
    
    # Test home endpoint
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ Home endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Home endpoint failed: {e}")
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Health endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
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
        print(f"✅ Prediction endpoint: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Total students: {result.get('summary', {}).get('total_students', 0)}")
            print(f"   Anomalies detected: {result.get('summary', {}).get('anomalies_detected', 0)}")
            print(f"   Average attendance: {result.get('summary', {}).get('average_attendance', 0):.1f}%")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Prediction endpoint failed: {e}")

if __name__ == "__main__":
    test_api()
