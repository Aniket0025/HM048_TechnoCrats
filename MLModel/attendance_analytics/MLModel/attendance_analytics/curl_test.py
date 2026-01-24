"""
Test using curl-like requests
"""

import urllib.request
import urllib.parse
import json

def test_with_urllib():
    """Test using urllib (built-in)"""
    base_url = "http://localhost:5000"
    
    print("🧪 Testing with urllib")
    print("=" * 40)
    
    # Test home
    try:
        with urllib.request.urlopen(f"{base_url}/") as response:
            data = response.read().decode('utf-8')
            print(f"Home: {response.status}")
            try:
                json_data = json.loads(data)
                print(f"   Status: {json_data.get('status')}")
                print(f"   Model Loaded: {json_data.get('model_loaded')}")
                print(f"   Model Type: {json_data.get('model_type')}")
            except:
                print(f"   Raw: {data[:100]}...")
    except Exception as e:
        print(f"Home failed: {e}")
    
    # Test health
    try:
        with urllib.request.urlopen(f"{base_url}/health") as response:
            data = response.read().decode('utf-8')
            print(f"\nHealth: {response.status}")
            try:
                json_data = json.loads(data)
                print(f"   Status: {json_data.get('status')}")
                print(f"   Message: {json_data.get('message')}")
                print(f"   Model Loaded: {json_data.get('model_loaded')}")
            except:
                print(f"   Raw: {data[:100]}...")
    except Exception as e:
        print(f"Health failed: {e}")
    
    # Test prediction
    try:
        test_data = {
            "data": [
                {"student_id": "STU001", "student_name": "John", "session_date": "2024-01-01", "attendance": 1},
                {"student_id": "STU001", "student_name": "John", "session_date": "2024-01-02", "attendance": 0}
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
            print(f"\nPredict: {response.status}")
            try:
                json_data = json.loads(data)
                print(f"   Status: {json_data.get('status')}")
                summary = json_data.get('summary', {})
                print(f"   Total Students: {summary.get('total_students')}")
                print(f"   Anomalies: {summary.get('anomalies_detected')}")
                print(f"   Model Used: {json_data.get('model_used')}")
            except:
                print(f"   Raw: {data[:200]}...")
    except Exception as e:
        print(f"Predict failed: {e}")

if __name__ == "__main__":
    test_with_urllib()
