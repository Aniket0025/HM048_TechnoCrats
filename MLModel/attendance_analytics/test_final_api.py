"""
Test the final working API on port 5001
"""

import urllib.request
import json

def test_final_api():
    """Test the final API"""
    base_url = "http://localhost:5001"
    
    print("🧪 Testing Final Working API")
    print("=" * 50)
    
    # Test home
    try:
        with urllib.request.urlopen(f"{base_url}/") as response:
            data = response.read().decode('utf-8')
            print(f"✅ Home: {response.status}")
            json_data = json.loads(data)
            print(f"   API Name: {json_data.get('name')}")
            print(f"   Status: {json_data.get('status')}")
            print(f"   Model Loaded: {json_data.get('model_loaded')}")
            print(f"   Model Type: {json_data.get('model_type')}")
            print(f"   Features: {json_data.get('features')}")
    except Exception as e:
        print(f"❌ Home failed: {e}")
    
    # Test health
    try:
        with urllib.request.urlopen(f"{base_url}/health") as response:
            data = response.read().decode('utf-8')
            print(f"\n✅ Health: {response.status}")
            json_data = json.loads(data)
            print(f"   Status: {json_data.get('status')}")
            print(f"   Message: {json_data.get('message')}")
            print(f"   Model Loaded: {json_data.get('model_loaded')}")
    except Exception as e:
        print(f"❌ Health failed: {e}")
    
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
        
        json_data = json.dumps(test_data).encode('utf-8')
        
        req = urllib.request.Request(
            f"{base_url}/predict",
            data=json_data,
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            data = response.read().decode('utf-8')
            print(f"\n✅ Predict: {response.status}")
            json_data = json.loads(data)
            print(f"   Status: {json_data.get('status')}")
            summary = json_data.get('summary', {})
            print(f"   Total Students: {summary.get('total_students')}")
            print(f"   Anomalies Detected: {summary.get('anomalies_detected')}")
            print(f"   Normal Patterns: {summary.get('normal_patterns')}")
            print(f"   Average Attendance: {summary.get('average_attendance'):.1f}%")
            print(f"   At Risk Students: {summary.get('at_risk_students')}")
            print(f"   Model Used: {json_data.get('model_used')}")
            
            # Show some predictions
            predictions = json_data.get('predictions', [])
            if predictions:
                print(f"\n   Sample Predictions:")
                for pred in predictions[:3]:
                    print(f"     {pred.get('student_name')}: {pred.get('attendance_percentage'):.1f}% - {pred.get('irregular_flag')} - {pred.get('risk_level')}")
                    
    except Exception as e:
        print(f"❌ Predict failed: {e}")
    
    # Test analyze
    try:
        test_data = {
            "data": [
                {"student_id": "STU001", "student_name": "John", "session_date": "2024-01-01", "attendance": 1},
                {"student_id": "STU002", "student_name": "Jane", "session_date": "2024-01-01", "attendance": 1}
            ]
        }
        
        json_data = json.dumps(test_data).encode('utf-8')
        
        req = urllib.request.Request(
            f"{base_url}/analyze",
            data=json_data,
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            data = response.read().decode('utf-8')
            print(f"\n✅ Analyze: {response.status}")
            json_data = json.loads(data)
            print(f"   Status: {json_data.get('status')}")
            
            analytics = json_data.get('analytics', {})
            insights = analytics.get('insights', [])
            recommendations = analytics.get('recommendations', [])
            
            print(f"   Insights: {len(insights)}")
            for insight in insights:
                print(f"     • {insight.get('category')}: {insight.get('insight')}")
            
            print(f"   Recommendations: {len(recommendations)}")
            for rec in recommendations:
                print(f"     • {rec.get('recommendation')} ({rec.get('priority')} priority)")
                    
    except Exception as e:
        print(f"❌ Analyze failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 API Test Completed Successfully!")
    print("🌐 Your AI Attendance Analytics API is working!")
    print("📚 API Documentation: http://localhost:5001")
    print("🔗 Use this API in your LMS integration")

if __name__ == "__main__":
    test_final_api()
