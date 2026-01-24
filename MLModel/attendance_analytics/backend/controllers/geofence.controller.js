import { GeoFenceZone } from "../models/GeoFenceZone.js";
import { calculateDistance } from "../routes/geofence.routes.js";

// Validate attendance with geo-fencing
export const validateAttendanceWithGeoFence = async (req, res) => {
  try {
    const { session_id, latitude, longitude, user_id } = req.body;

    if (!session_id || !latitude || !longitude || !user_id) {
      return res.status(400).json({
        message: "Missing required fields: session_id, latitude, longitude, user_id",
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        message: "Invalid latitude or longitude values",
      });
    }

    // Find active geo-fences for this session
    const fences = await GeoFenceZone.find({
      session_id,
      is_active: true,
    }).populate("session_id", "session_name college_name")
     .populate("batch_id", "batch_name");

    if (fences.length === 0) {
      return res.json({
        success: true,
        is_valid: true, // No geo-fence restrictions
        message: "No geo-fence restrictions for this session",
        fences_checked: 0,
      });
    }

    // Check each fence
    const results = [];
    let validFence = null;

    for (const fence of fences) {
      const distance = calculateDistance(lat, lon, fence.latitude, fence.longitude);
      const isWithin = distance <= fence.radius_meters;
      const accuracyScore = Math.max(0, 1 - (distance / fence.radius_meters));

      const result = {
        fence_id: fence._id,
        location_name: fence.location_name,
        distance_meters: Math.round(distance),
        fence_radius: fence.radius_meters,
        is_within_fence: isWithin,
        accuracy_score: accuracyScore,
        college_name: fence.college_name,
        batch_name: fence.batch_id?.batch_name || null,
      };

      results.push(result);

      if (isWithin && !validFence) {
        validFence = result;
      }
    }

    res.json({
      success: true,
      is_valid: validFence !== null,
      message: validFence 
        ? `Location validated within ${validFence.location_name}` 
        : "Location is outside all designated geo-fence zones",
      valid_fence: validFence,
      all_results: results,
      fences_checked: results.length,
      validation_timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error validating attendance with geo-fence:", error);
    res.status(500).json({
      message: "Error validating attendance location",
      error: error.message,
    });
  }
};

// Get geo-fence statistics for a session
export const getGeoFenceStats = async (req, res) => {
  try {
    const { session_id } = req.params;

    if (!session_id) {
      return res.status(400).json({
        message: "Session ID is required",
      });
    }

    const fences = await GeoFenceZone.find({
      session_id,
      is_active: true,
    }).populate("session_id", "session_name college_name")
     .populate("batch_id", "batch_name");

    let totalCoverageArea = 0;
    const fenceStats = [];

    for (const fence of fences) {
      const area = Math.PI * (fence.radius_meters ** 2);
      totalCoverageArea += area;

      fenceStats.push({
        fence_id: fence._id,
        location_name: fence.location_name,
        radius_meters: fence.radius_meters,
        coverage_area_meters_squared: area,
        college_name: fence.college_name,
        batch_name: fence.batch_id?.batch_name || null,
      });
    }

    res.json({
      success: true,
      session_id,
      total_fences: fences.length,
      total_coverage_area_meters_squared: totalCoverageArea,
      fence_statistics: fenceStats,
    });
  } catch (error) {
    console.error("Error getting geo-fence stats:", error);
    res.status(500).json({
      message: "Error getting geo-fence statistics",
      error: error.message,
    });
  }
};

// Get nearby geo-fences for a location
export const getNearbyGeoFences = async (req, res) => {
  try {
    const { latitude, longitude, max_distance = 1000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Missing required query parameters: latitude, longitude",
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const maxDist = parseInt(max_distance);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        message: "Invalid latitude or longitude values",
      });
    }

    // Find all active fences
    const fences = await GeoFenceZone.find({
      is_active: true,
    }).populate("session_id", "session_name college_name")
     .populate("batch_id", "batch_name");

    // Calculate distances and filter
    const nearbyFences = fences.map(fence => {
      const distance = calculateDistance(lat, lon, fence.latitude, fence.longitude);
      return {
        ...fence.toObject(),
        distance_meters: Math.round(distance),
        is_within_fence: distance <= fence.radius_meters,
      };
    }).filter(fence => fence.distance_meters <= maxDist);

    // Sort by distance
    nearbyFences.sort((a, b) => a.distance_meters - b.distance_meters);

    res.json({
      success: true,
      latitude: lat,
      longitude: lon,
      max_distance_meters: maxDist,
      nearby_fences: nearbyFences,
      count: nearbyFences.length,
    });
  } catch (error) {
    console.error("Error getting nearby geo-fences:", error);
    res.status(500).json({
      message: "Error finding nearby geo-fences",
      error: error.message,
    });
  }
};
