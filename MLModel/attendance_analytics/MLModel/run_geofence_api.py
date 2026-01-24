#!/usr/bin/env python3
"""
GeoFence API Server Runner
This script starts the Flask API server for geo-fencing functionality.
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("Error: Python 3.8 or higher is required")
        sys.exit(1)
    print(f"Python version: {sys.version}")

def install_dependencies():
    """Install required dependencies"""
    print("Installing dependencies...")
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        print("Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"Error installing dependencies: {e}")
        sys.exit(1)

def start_api_server():
    """Start the Flask API server"""
    print("Starting GeoFence API Server...")
    print("API will be available at: http://localhost:5001")
    print("Health check: http://localhost:5001/health")
    print("\nAvailable endpoints:")
    print("  GET  /health")
    print("  POST /api/geofence/validate")
    print("  POST /api/geofence/create")
    print("  GET  /api/geofence/list")
    print("  PUT  /api/geofence/<fence_id>")
    print("  DELETE /api/geofence/<fence_id>")
    print("  POST /api/geofence/optimize-radius")
    print("  POST /api/geofence/detect-anomalies")
    print("  GET  /api/geofence/coverage-area")
    print("\nPress Ctrl+C to stop the server")
    
    try:
        from geofence_api import app
        app.run(host='0.0.0.0', port=5001, debug=True)
    except ImportError as e:
        print(f"Error importing geofence_api: {e}")
        print("Make sure all dependencies are installed")
        sys.exit(1)
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

def main():
    """Main function"""
    # Change to the MLModel directory
    mlmodel_dir = Path(__file__).parent
    os.chdir(mlmodel_dir)
    
    print("=== GeoFence API Server Setup ===")
    
    # Check Python version
    check_python_version()
    
    # Check if requirements.txt exists
    if not Path("requirements.txt").exists():
        print("Error: requirements.txt not found")
        sys.exit(1)
    
    # Ask user if they want to install dependencies
    install_deps = input("Install dependencies? (y/n): ").lower().strip()
    if install_deps in ['y', 'yes']:
        install_dependencies()
    
    # Start the API server
    start_api_server()

if __name__ == "__main__":
    main()
