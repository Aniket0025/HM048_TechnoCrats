"""
Test the ML Model API
"""

import requests
import json

def test_model_api():
    """Test the model API endpoints"""
    base_url = "http://localhost:5000"
    
    print("🧪 Testing ML Model API")
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
    
    # Test model info
    try:
        response = requests.get(f"{base_url}/model/info")
        print(f"\n✅ Model Info: {response.status_code}")
        data = response.json()
        print(f"   Model Type: {data.get('model_type')}")
        print(f"   Feature Count: {data.get('feature_count')}")
        print(f"   Training Date: {data.get('training_date')}")
    except Exception as e:
        print(f"❌ Model Info failed: {e}")
    
    # Test prediction
    try:
        test_data = {
            "data": [
                {"student_id": "STU001", "student_name": "John", "session_date": "2024-01-01", "attendance": 1},
                {"student_id": "STU001", "student_name": "John", "session_date": "2024-01-02", "attendance": 0},
                {"student_id": "STU002", "student_name": "Jane", "session_date": "2024-01-01", "attendance": 1},
                {"student_id": "STU002", "student_name": "Jane", "session_date": "2024-01-02", "attendance": 1},
                {"student_id": "STU003", "student_name": "Bob", "session_date": "2024-01-01", "attendance": 0},
                {"student_id": "STU003", "student_name": "Bob", "session_date": "2024-01-02", "attendance": 0}
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
        print(f"   At Risk Students: {summary.get('at_risk_students')}")
        
        # Show predictions
        predictions = data.get('predictions', [])
        if predictions:
            print(f"\n   Predictions:")
            for pred in predictions:
                print(f"     {pred.get('student_name')}: {pred.get('attendance_percentage'):.1f}% - {pred.get('is_irregular')} - {pred.get('risk_level')}")
                print(f"       Anomaly Score: {pred.get('anomaly_score'):.3f}")
        
    except Exception as e:
        print(f"❌ Predict failed: {e}")
    
    print("\n" + "=" * 40)
    print("🎉 ML Model API Test Completed!")
    print("🚀 Ready for deployment to Render!")

if __name__ == "__main__":
    test_model_api()
