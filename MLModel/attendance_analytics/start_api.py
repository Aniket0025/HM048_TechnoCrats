"""
Startup script for AI Attendance Analytics API
"""

import os
import sys
import subprocess
import requests
import time
from datetime import datetime

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    required_packages = ['flask', 'flask_cors', 'pandas', 'numpy', 'sklearn']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package}")
    
    if missing_packages:
        print(f"\n📦 Installing missing packages: {missing_packages}")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + missing_packages)
        print("✅ Dependencies installed")
    else:
        print("✅ All dependencies satisfied")

def check_model_files():
    """Check if model files exist"""
    print("\n🤖 Checking model files...")
    
    model_files = [
        'models/isolation_forest.pkl',
        'models/scaler.pkl',
        'models/metadata.json'
    ]
    
    missing_files = []
    for file_path in model_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            missing_files.append(file_path)
            print(f"❌ {file_path}")
    
    if missing_files:
        print(f"\n⚠️  Missing model files: {missing_files}")
        print("🔄 Training model...")
        try:
            subprocess.check_call([sys.executable, 'train_model.py'])
            print("✅ Model trained successfully")
        except subprocess.CalledProcessError:
            print("❌ Failed to train model")
            return False
    
    return True

def test_api_connection(base_url="http://localhost:5000"):
    """Test API connection"""
    print(f"\n🌐 Testing API connection at {base_url}")
    
    max_attempts = 10
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"{base_url}/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print("✅ API is healthy!")
                print(f"📊 Status: {data.get('status', 'Unknown')}")
                print(f"🤖 Model: {data.get('model_type', 'Unknown')}")
                return True
        except requests.exceptions.RequestException:
            pass
        
        print(f"⏳ Waiting for API to start... ({attempt + 1}/{max_attempts})")
        time.sleep(2)
    
    print("❌ Failed to connect to API")
    return False

def start_api_server():
    """Start the API server"""
    print("\n🚀 Starting AI Attendance Analytics API...")
    print("=" * 60)
    
    # Check dependencies
    check_dependencies()
    
    # Check model files
    if not check_model_files():
        print("❌ Cannot start API without model files")
        return False
    
    # Start Flask server
    print("\n🌐 Starting Flask server...")
    print("📍 API will be available at: http://localhost:5000")
    print("📊 Web interface: http://localhost:5000")
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        # Import and run Flask app
        from app import app
        app.run(host='0.0.0.0', port=5000, debug=False)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False
    
    return True

def show_api_info():
    """Show API information"""
    print("\n📚 API Documentation:")
    print("=" * 60)
    print("🌐 Base URL: http://localhost:5000")
    print("📊 Web Interface: http://localhost:5000")
    print()
    print("📋 Available Endpoints:")
    print("  GET  /health              - Check API health")
    print("  GET  /model/info          - Get model information")
    print("  POST /predict            - Predict anomalies")
    print("  POST /analyze            - Complete analysis")
    print("  POST /report             - Generate HTML report")
    print()
    print("🧪 Example Usage:")
    print("  curl -X GET http://localhost:5000/health")
    print("  curl -X POST http://localhost:5000/predict -H 'Content-Type: application/json' -d '{\"data\": [{\"student_id\": \"STU001\", \"student_name\": \"John\", \"session_date\": \"2024-01-01\", \"attendance\": 1}]}'")
    print("=" * 60)

if __name__ == "__main__":
    print("🎯 AI Attendance Analytics API - Startup Script")
    print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "test":
            # Test API connection only
            test_api_connection()
        elif sys.argv[1] == "info":
            # Show API information
            show_api_info()
        else:
            print("Usage: python start_api.py [test|info]")
    else:
        # Start full API server
        show_api_info()
        start_api_server()
