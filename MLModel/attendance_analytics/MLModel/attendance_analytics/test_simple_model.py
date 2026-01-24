"""
Test the simple model API on port 5002
"""

import requests
import json

def test_simple_model():
    """Test the simple model API"""
    base_url = "http://localhost:5002"
    
    print("🧪 Testing Simple Model API")
    print("=" * 40)
    
    # Test home
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ Home: {response.status_code}")
        data = response.json()
        print(f"   API: {data.get('name')}")
        print(f"   Model Loaded: {data.get('model_loaded')}")
        print(f"   Model Type: {data.get('model_type')}")
    except Exception as e:
        print(f"❌ Home failed: {e}")
    
    # Test health
    try:
        response = requests.get(f"{base_url}/health")
        print(f"\n✅ Health: {response.status_code}")
        data = response.json()
        print(f"   Status: {data.get('status')}")
        print(f"   Model Loaded: {data.get('model_loaded')}")
    except Exception as e:
        print(f"❌ Health failed: {e}")
    
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
        print(f"\n✅ Predict: {response.status_code}")
        data = response.json()
        print(f"   Status: {data.get('status')}")
        summary = data.get('summary', {})
        print(f"   Total Students: {summary.get('total_students')}")
        print(f"   Anomalies Detected: {summary.get('anomalies_detected')}")
        print(f"   Average Attendance: {summary.get('average_attendance'):.1f}%")
        
        # Show predictions
        predictions = data.get('predictions', [])
        if predictions:
            print(f"\n   Predictions:")
            for pred in predictions:
                print(f"     {pred.get('student_name')}: {pred.get('attendance_percentage'):.1f}% - {pred.get('is_irregular')} - {pred.get('risk_level')}")
        
    except Exception as e:
        print(f"❌ Predict failed: {e}")
    
    print("\n" + "=" * 40)
    print("🎉 Simple Model API Test Completed!")

if __name__ == "__main__":
    test_simple_model()
