"""
Test API functionality
"""

import sys
sys.path.append('src')
from prediction import AttendancePredictor

def test_model_loading():
    """Test if model loads correctly"""
    print("🔍 Testing model loading...")
    
    try:
        predictor = AttendancePredictor()
        if predictor.load_model_artifacts():
            print("✅ Model loaded successfully")
            
            # Test model info
            info = predictor.get_model_info()
            print(f"📊 Model type: {info.get('model_type', 'Unknown')}")
            print(f"🔢 Feature count: {info.get('feature_count', 'Unknown')}")
            return True
        else:
            print("❌ Failed to load model")
            return False
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False

if __name__ == "__main__":
    test_model_loading()
