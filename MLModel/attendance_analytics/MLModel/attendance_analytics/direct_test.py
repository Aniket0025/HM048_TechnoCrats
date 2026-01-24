"""
Direct test using requests
"""

import requests
import json

def test_direct():
    """Test the API directly"""
    base_url = "http://localhost:5000"
    
    print("🧪 Direct API Test")
    print("=" * 40)
    
    # Test home
    try:
        response = requests.get(f"{base_url}/")
        print(f"Home: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Status: {data.get('status')}")
            print(f"   Model Loaded: {data.get('model_loaded')}")
            print(f"   Message: {data.get('message')}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"Home failed: {e}")
    
    # Test health
    try:
        response = requests.get(f"{base_url}/health")
        print(f"\nHealth: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Status: {data.get('status')}")
            print(f"   Message: {data.get('message')}")
            print(f"   Model Loaded: {data.get('model_loaded')}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"Health failed: {e}")
    
    # Test prediction
    try:
        test_data = {
            "data": [
                {"student_id": "STU001", "student_name": "John", "session_date": "2024-01-01", "attendance": 1},
                {"student_id": "STU001", "student_name": "John", "session_date": "2024-01-02", "attendance": 0},
                {"student_id": "STU002", "student_name": "Jane", "session_date": "2024-01-01", "attendance": 1},
                {"student_id": "STU002", "student_name": "Jane", "session_date": "2024-01-02", "attendance": 1}
            ]
        }
        
        response = requests.post(f"{base_url}/predict", json=test_data)
        print(f"\nPredict: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Status: {data.get('status')}")
            summary = data.get('summary', {})
            print(f"   Total Students: {summary.get('total_students')}")
            print(f"   Anomalies: {summary.get('anomalies_detected')}")
            print(f"   Avg Attendance: {summary.get('average_attendance')}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"Predict failed: {e}")

if __name__ == "__main__":
    test_direct()
