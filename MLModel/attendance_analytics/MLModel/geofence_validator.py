import math
import json
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class GeoFenceZone:
    """Data class for geo-fence zone"""
    id: str
    session_id: str
    location_name: str
    latitude: float
    longitude: float
    radius_meters: int
    college_name: str
    batch_id: Optional[str] = None
    is_active: bool = True
    created_date: Optional[str] = None

@dataclass
class LocationPoint:
    """Data class for location point"""
    latitude: float
    longitude: float
    timestamp: Optional[datetime] = None
    user_id: Optional[str] = None

class GeoFenceValidator:
    """
    ML-powered Geo-fencing validator for attendance systems
    """
    
    def __init__(self):
        self.earth_radius_km = 6371.0  # Earth's radius in kilometers
        self.accuracy_threshold_meters = 10  # GPS accuracy threshold
        
    def haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate the great circle distance between two points on earth using Haversine formula
        
        Args:
            lat1, lon1: Latitude and longitude of first point
            lat2, lon2: Latitude and longitude of second point
            
        Returns:
            Distance in meters
        """
        # Convert latitude and longitude from degrees to radians
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        # Differences
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        # Haversine formula
        a = (math.sin(dlat / 2) ** 2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        # Distance in kilometers, convert to meters
        distance_km = self.earth_radius_km * c
        distance_meters = distance_km * 1000
        
        return distance_meters
    
    def is_point_in_fence(self, point: LocationPoint, fence: GeoFenceZone) -> Dict:
        """
        Check if a location point is within a geo-fence zone
        
        Args:
            point: Location point to check
            fence: Geo-fence zone
            
        Returns:
            Dictionary with validation results
        """
        try:
            distance = self.haversine_distance(
                point.latitude, point.longitude,
                fence.latitude, fence.longitude
            )
            
            is_within = distance <= fence.radius_meters
            
            return {
                'is_within_fence': is_within,
                'distance_meters': distance,
                'fence_radius': fence.radius_meters,
                'fence_id': fence.id,
                'location_name': fence.location_name,
                'accuracy_score': max(0, 1 - (distance / fence.radius_meters)),
                'validation_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error validating geo-fence: {str(e)}")
            return {
                'is_within_fence': False,
                'error': str(e),
                'validation_timestamp': datetime.now().isoformat()
            }
    
    def validate_multiple_fences(self, point: LocationPoint, fences: List[GeoFenceZone]) -> Dict:
        """
        Validate a location point against multiple geo-fence zones
        
        Args:
            point: Location point to check
            fences: List of geo-fence zones
            
        Returns:
            Dictionary with comprehensive validation results
        """
        results = []
        valid_fences = []
        
        for fence in fences:
            if not fence.is_active:
                continue
                
            result = self.is_point_in_fence(point, fence)
            result['fence'] = fence
            results.append(result)
            
            if result['is_within_fence']:
                valid_fences.append(result)
        
        # Sort by accuracy score (highest first)
        valid_fences.sort(key=lambda x: x.get('accuracy_score', 0), reverse=True)
        
        return {
            'point': {
                'latitude': point.latitude,
                'longitude': point.longitude,
                'timestamp': point.timestamp.isoformat() if point.timestamp else None
            },
            'total_fences_checked': len(results),
            'valid_fences_count': len(valid_fences),
            'is_within_any_fence': len(valid_fences) > 0,
            'best_match': valid_fences[0] if valid_fences else None,
            'all_results': results,
            'validation_timestamp': datetime.now().isoformat()
        }
    
    def get_fence_coverage_area(self, fence: GeoFenceZone) -> float:
        """
        Calculate the approximate coverage area of a circular geo-fence
        
        Args:
            fence: Geo-fence zone
            
        Returns:
            Area in square meters
        """
        return math.pi * (fence.radius_meters ** 2)
    
    def optimize_fence_radius(self, center_lat: float, center_lon: float, 
                            test_points: List[LocationPoint], 
                            desired_coverage: float = 0.95) -> int:
        """
        ML-based optimization to find optimal fence radius
        
        Args:
            center_lat, center_lon: Center coordinates of the fence
            test_points: List of test location points
            desired_coverage: Desired coverage percentage (0.0 to 1.0)
            
        Returns:
            Optimal radius in meters
        """
        if not test_points:
            return 50  # Default radius
        
        distances = []
        for point in test_points:
            distance = self.haversine_distance(
                center_lat, center_lon,
                point.latitude, point.longitude
            )
            distances.append(distance)
        
        # Sort distances and find the radius that covers desired percentage
        distances.sort()
        index = int(len(distances) * desired_coverage)
        optimal_radius = distances[min(index, len(distances) - 1)]
        
        # Add buffer for GPS accuracy
        optimal_radius += self.accuracy_threshold_meters
        
        return max(30, min(500, int(optimal_radius)))  # Min 30m, Max 500m
    
    def detect_location_anomalies(self, user_id: str, location_history: List[LocationPoint]) -> Dict:
        """
        Detect anomalous location patterns using statistical analysis
        
        Args:
            user_id: User identifier
            location_history: List of historical location points
            
        Returns:
            Dictionary with anomaly detection results
        """
        if len(location_history) < 3:
            return {
                'has_anomalies': False,
                'reason': 'Insufficient data for analysis',
                'sample_size': len(location_history)
            }
        
        # Calculate average speed between consecutive points
        speeds = []
        for i in range(1, len(location_history)):
            if location_history[i].timestamp and location_history[i-1].timestamp:
                distance = self.haversine_distance(
                    location_history[i-1].latitude, location_history[i-1].longitude,
                    location_history[i].latitude, location_history[i].longitude
                )
                
                time_diff = (location_history[i].timestamp - location_history[i-1].timestamp).total_seconds()
                
                if time_diff > 0:
                    speed_mps = distance / time_diff  # meters per second
                    speeds.append(speed_mps)
        
        # Detect anomalies (speed > 30 m/s = ~108 km/h)
        anomaly_threshold = 30  # m/s
        anomalies = [speed for speed in speeds if speed > anomaly_threshold]
        
        return {
            'has_anomalies': len(anomalies) > 0,
            'anomaly_count': len(anomalies),
            'total_samples': len(speeds),
            'max_speed': max(speeds) if speeds else 0,
            'avg_speed': sum(speeds) / len(speeds) if speeds else 0,
            'anomaly_threshold': anomaly_threshold,
            'anomaly_percentage': (len(anomalies) / len(speeds) * 100) if speeds else 0
        }

# Utility functions for integration
def create_fence_from_dict(fence_data: Dict) -> GeoFenceZone:
    """Create GeoFenceZone from dictionary"""
    return GeoFenceZone(
        id=str(fence_data.get('_id', fence_data.get('id'))),
        session_id=str(fence_data.get('session_id')),
        location_name=fence_data.get('location_name', ''),
        latitude=float(fence_data.get('latitude', 0)),
        longitude=float(fence_data.get('longitude', 0)),
        radius_meters=int(fence_data.get('radius_meters', 50)),
        college_name=fence_data.get('college_name', ''),
        batch_id=fence_data.get('batch_id'),
        is_active=fence_data.get('is_active', True),
        created_date=fence_data.get('created_date')
    )

def create_location_from_dict(location_data: Dict) -> LocationPoint:
    """Create LocationPoint from dictionary"""
    timestamp = None
    if location_data.get('timestamp'):
        try:
            timestamp = datetime.fromisoformat(location_data['timestamp'])
        except:
            pass
    
    return LocationPoint(
        latitude=float(location_data.get('latitude', 0)),
        longitude=float(location_data.get('longitude', 0)),
        timestamp=timestamp,
        user_id=location_data.get('user_id')
    )

# Example usage and testing
if __name__ == "__main__":
    # Initialize validator
    validator = GeoFenceValidator()
    
    # Create test fence
    test_fence = GeoFenceZone(
        id="test_fence_1",
        session_id="session_1",
        location_name="Classroom 101",
        latitude=18.5204,
        longitude=73.8567,
        radius_meters=50,
        college_name="Test College"
    )
    
    # Create test location (within fence)
    test_point = LocationPoint(
        latitude=18.5205,
        longitude=73.8568,
        timestamp=datetime.now()
    )
    
    # Validate
    result = validator.is_point_in_fence(test_point, test_fence)
    print("Validation Result:", json.dumps(result, indent=2, default=str))
    
    # Test multiple fences
    fences = [test_fence]
    multi_result = validator.validate_multiple_fences(test_point, fences)
    print("\nMultiple Fences Result:", json.dumps(multi_result, indent=2, default=str))
