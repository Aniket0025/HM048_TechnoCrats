from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json
from datetime import datetime
from typing import Dict, List

# Add parent directory to path to import the geofence validator
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from MLModel.geofence_validator import GeoFenceValidator, GeoFenceZone, LocationPoint, create_fence_from_dict, create_location_from_dict

app = Flask(__name__)
CORS(app)

# Initialize the geo-fence validator
validator = GeoFenceValidator()

# Mock data storage (in production, use a database)
geo_fences_db = []
location_history_db = []

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'GeoFence API',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/geofence/validate', methods=['POST'])
def validate_location():
    """
    Validate if a location point is within any geo-fence zones
    
    Request body:
    {
        "latitude": 18.5204,
        "longitude": 73.8567,
        "user_id": "user123",
        "session_id": "session456"  # Optional - filter by session
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'latitude' not in data or 'longitude' not in data:
            return jsonify({
                'error': 'Missing required fields: latitude, longitude'
            }), 400
        
        # Create location point
        location = create_location_from_dict({
            'latitude': data['latitude'],
            'longitude': data['longitude'],
            'user_id': data.get('user_id'),
            'timestamp': datetime.now().isoformat()
        })
        
        # Filter fences by session if provided
        fences_to_check = geo_fences_db
        if 'session_id' in data:
            fences_to_check = [f for f in geo_fences_db if f.session_id == data['session_id']]
        
        # Validate against all active fences
        result = validator.validate_multiple_fences(location, fences_to_check)
        
        # Store in location history
        location_history_db.append(location)
        
        return jsonify({
            'success': True,
            'result': result
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/geofence/create', methods=['POST'])
def create_geofence():
    """
    Create a new geo-fence zone
    
    Request body:
    {
        "session_id": "session456",
        "location_name": "Classroom 101",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "radius_meters": 50,
        "college_name": "Test College",
        "batch_id": "batch123"  # Optional
    }
    """
    try:
        data = request.get_json()
        
        required_fields = ['session_id', 'location_name', 'latitude', 'longitude', 'radius_meters', 'college_name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Create new fence
        new_fence = GeoFenceZone(
            id=f"fence_{len(geo_fences_db) + 1}_{int(datetime.now().timestamp())}",
            session_id=data['session_id'],
            location_name=data['location_name'],
            latitude=float(data['latitude']),
            longitude=float(data['longitude']),
            radius_meters=int(data['radius_meters']),
            college_name=data['college_name'],
            batch_id=data.get('batch_id'),
            is_active=True,
            created_date=datetime.now().isoformat()
        )
        
        geo_fences_db.append(new_fence)
        
        return jsonify({
            'success': True,
            'fence': {
                'id': new_fence.id,
                'session_id': new_fence.session_id,
                'location_name': new_fence.location_name,
                'latitude': new_fence.latitude,
                'longitude': new_fence.longitude,
                'radius_meters': new_fence.radius_meters,
                'college_name': new_fence.college_name,
                'batch_id': new_fence.batch_id,
                'is_active': new_fence.is_active,
                'created_date': new_fence.created_date
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/geofence/list', methods=['GET'])
def list_geofences():
    """
    List all geo-fence zones
    
    Query parameters:
    - session_id: Filter by session ID (optional)
    - college_name: Filter by college name (optional)
    - is_active: Filter by active status (optional)
    """
    try:
        session_id = request.args.get('session_id')
        college_name = request.args.get('college_name')
        is_active = request.args.get('is_active')
        
        fences = geo_fences_db
        
        # Apply filters
        if session_id:
            fences = [f for f in fences if f.session_id == session_id]
        if college_name:
            fences = [f for f in fences if f.college_name == college_name]
        if is_active is not None:
            fences = [f for f in fences if f.is_active == (is_active.lower() == 'true')]
        
        # Convert to dict format
        fence_list = []
        for fence in fences:
            fence_list.append({
                'id': fence.id,
                'session_id': fence.session_id,
                'location_name': fence.location_name,
                'latitude': fence.latitude,
                'longitude': fence.longitude,
                'radius_meters': fence.radius_meters,
                'college_name': fence.college_name,
                'batch_id': fence.batch_id,
                'is_active': fence.is_active,
                'created_date': fence.created_date
            })
        
        return jsonify({
            'success': True,
            'fences': fence_list,
            'total_count': len(fence_list)
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/geofence/<fence_id>', methods=['PUT'])
def update_geofence(fence_id):
    """
    Update an existing geo-fence zone
    
    Request body: Same as create, but all fields are optional
    """
    try:
        data = request.get_json()
        
        # Find the fence
        fence_index = -1
        for i, fence in enumerate(geo_fences_db):
            if fence.id == fence_id:
                fence_index = i
                break
        
        if fence_index == -1:
            return jsonify({
                'error': 'Geo-fence not found',
                'success': False
            }), 404
        
        # Update fence
        fence = geo_fences_db[fence_index]
        
        if 'session_id' in data:
            fence.session_id = data['session_id']
        if 'location_name' in data:
            fence.location_name = data['location_name']
        if 'latitude' in data:
            fence.latitude = float(data['latitude'])
        if 'longitude' in data:
            fence.longitude = float(data['longitude'])
        if 'radius_meters' in data:
            fence.radius_meters = int(data['radius_meters'])
        if 'college_name' in data:
            fence.college_name = data['college_name']
        if 'batch_id' in data:
            fence.batch_id = data['batch_id']
        if 'is_active' in data:
            fence.is_active = bool(data['is_active'])
        
        return jsonify({
            'success': True,
            'fence': {
                'id': fence.id,
                'session_id': fence.session_id,
                'location_name': fence.location_name,
                'latitude': fence.latitude,
                'longitude': fence.longitude,
                'radius_meters': fence.radius_meters,
                'college_name': fence.college_name,
                'batch_id': fence.batch_id,
                'is_active': fence.is_active,
                'created_date': fence.created_date
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/geofence/<fence_id>', methods=['DELETE'])
def delete_geofence(fence_id):
    """Delete a geo-fence zone"""
    try:
        global geo_fences_db
        
        # Find and remove the fence
        original_count = len(geo_fences_db)
        geo_fences_db = [f for f in geo_fences_db if f.id != fence_id]
        
        if len(geo_fences_db) == original_count:
            return jsonify({
                'error': 'Geo-fence not found',
                'success': False
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Geo-fence deleted successfully'
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/geofence/optimize-radius', methods=['POST'])
def optimize_fence_radius():
    """
    ML-based optimization for fence radius
    
    Request body:
    {
        "center_latitude": 18.5204,
        "center_longitude": 73.8567,
        "test_points": [
            {"latitude": 18.5205, "longitude": 73.8568},
            ...
        ],
        "desired_coverage": 0.95  # Optional, default 0.95
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'center_latitude' not in data or 'center_longitude' not in data:
            return jsonify({
                'error': 'Missing required fields: center_latitude, center_longitude'
            }), 400
        
        # Create test points
        test_points = []
        for point_data in data.get('test_points', []):
            test_points.append(create_location_from_dict(point_data))
        
        # Optimize radius
        optimal_radius = validator.optimize_fence_radius(
            float(data['center_latitude']),
            float(data['center_longitude']),
            test_points,
            data.get('desired_coverage', 0.95)
        )
        
        return jsonify({
            'success': True,
            'optimal_radius_meters': optimal_radius,
            'test_points_count': len(test_points),
            'desired_coverage': data.get('desired_coverage', 0.95)
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/geofence/detect-anomalies', methods=['POST'])
def detect_location_anomalies():
    """
    Detect anomalous location patterns for a user
    
    Request body:
    {
        "user_id": "user123",
        "location_history": [
            {"latitude": 18.5204, "longitude": 73.8567, "timestamp": "2024-01-15T09:00:00"},
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data or 'location_history' not in data:
            return jsonify({
                'error': 'Missing required fields: user_id, location_history'
            }), 400
        
        # Create location history
        location_history = []
        for point_data in data['location_history']:
            location_history.append(create_location_from_dict(point_data))
        
        # Detect anomalies
        result = validator.detect_location_anomalies(data['user_id'], location_history)
        
        return jsonify({
            'success': True,
            'anomaly_detection': result
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/geofence/coverage-area', methods=['GET'])
def get_coverage_area():
    """
    Get coverage area statistics for all fences
    
    Query parameters:
    - session_id: Filter by session ID (optional)
    """
    try:
        session_id = request.args.get('session_id')
        
        fences = geo_fences_db
        if session_id:
            fences = [f for f in fences if f.session_id == session_id]
        
        total_area = 0
        fence_areas = []
        
        for fence in fences:
            area = validator.get_fence_coverage_area(fence)
            fence_areas.append({
                'fence_id': fence.id,
                'location_name': fence.location_name,
                'area_meters_squared': area,
                'radius_meters': fence.radius_meters
            })
            total_area += area
        
        return jsonify({
            'success': True,
            'total_coverage_area_meters_squared': total_area,
            'fence_count': len(fences),
            'individual_fence_areas': fence_areas
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    print("Starting GeoFence API Server...")
    print("Available endpoints:")
    print("  GET  /health")
    print("  POST /api/geofence/validate")
    print("  POST /api/geofence/create")
    print("  GET  /api/geofence/list")
    print("  PUT  /api/geofence/<fence_id>")
    print("  DELETE /api/geofence/<fence_id>")
    print("  POST /api/geofence/optimize-radius")
    print("  POST /api/geofence/detect-anomalies")
    print("  GET  /api/geofence/coverage-area")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
