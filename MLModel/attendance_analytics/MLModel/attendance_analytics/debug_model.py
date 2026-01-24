"""
Debug model loading issues
"""

import sys
import os
sys.path.append('src')

def debug_model_loading():
    """Debug model loading step by step"""
    print("🔍 Debugging Model Loading")
    print("=" * 50)
    
    # Step 1: Check current directory
    print(f"📁 Current directory: {os.getcwd()}")
    
    # Step 2: Check model files
    model_files = ['models/isolation_forest.pkl', 'models/scaler.pkl', 'models/metadata.json']
    for file_path in model_files:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"✅ {file_path} ({size} bytes)")
        else:
            print(f"❌ {file_path} - NOT FOUND")
    
    # Step 3: Try importing modules
    try:
        print("\n📦 Testing imports...")
        from prediction import AttendancePredictor
        print("✅ AttendancePredictor imported successfully")
        
        from feature_engineering import AttendanceFeatureEngineer
        print("✅ AttendanceFeatureEngineer imported successfully")
        
        from analytics import AttendanceAnalytics
        print("✅ AttendanceAnalytics imported successfully")
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False
    
    # Step 4: Try loading model
    try:
        print("\n🤖 Testing model loading...")
        predictor = AttendancePredictor()
        
        if predictor.load_model_artifacts():
            print("✅ Model loaded successfully")
            
            # Test model info
            info = predictor.get_model_info()
            print(f"📊 Model type: {info.get('model_type', 'Unknown')}")
            print(f"🔢 Feature count: {info.get('feature_count', 'Unknown')}")
            print(f"📅 Training date: {info.get('training_date', 'Unknown')}")
            
            # Test feature engineer
            print("\n🔧 Testing feature engineer...")
            engineer = AttendanceFeatureEngineer()
            print(f"✅ Feature engineer initialized")
            
            return True
        else:
            print("❌ Failed to load model artifacts")
            return False
            
    except Exception as e:
        print(f"❌ Model loading error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_simple_prediction():
    """Test a simple prediction"""
    print("\n🧪 Testing Simple Prediction")
    print("=" * 50)
    
    try:
        from prediction import AttendancePredictor
        from feature_engineering import AttendanceFeatureEngineer
        import pandas as pd
        
        # Create test data
        test_data = [
            {"student_id": "STU001", "student_name": "John", "session_date": "2024-01-01", "attendance": 1},
            {"student_id": "STU001", "student_name": "John", "session_date": "2024-01-02", "attendance": 1},
            {"student_id": "STU001", "student_name": "John", "session_date": "2024-01-03", "attendance": 0},
            {"student_id": "STU002", "student_name": "Jane", "session_date": "2024-01-01", "attendance": 1},
            {"student_id": "STU002", "student_name": "Jane", "session_date": "2024-01-02", "attendance": 1},
            {"student_id": "STU002", "student_name": "Jane", "session_date": "2024-01-03", "attendance": 1},
        ]
        
        df = pd.DataFrame(test_data)
        print(f"📊 Test data created: {len(df)} records")
        
        # Initialize components
        predictor = AttendancePredictor()
        engineer = AttendanceFeatureEngineer()
        
        # Load model
        if predictor.load_model_artifacts():
            print("✅ Model loaded")
            
            # Extract features
            features_df = engineer.extract_features_from_dataframe(df)
            print(f"✅ Features extracted: {len(features_df.columns)} columns")
            
            # Make prediction
            predictions_df = predictor.generate_predictions(features_df)
            print(f"✅ Predictions generated: {len(predictions_df)} students")
            
            # Show results
            for _, row in predictions_df.iterrows():
                print(f"👤 {row['student_name']}: {row['attendance_percentage']:.1f}% - {row['irregular_flag']}")
            
            return True
        else:
            print("❌ Failed to load model")
            return False
            
    except Exception as e:
        print(f"❌ Prediction test error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if debug_model_loading():
        test_simple_prediction()
    else:
        print("\n❌ Cannot proceed with prediction test due to model loading issues")
