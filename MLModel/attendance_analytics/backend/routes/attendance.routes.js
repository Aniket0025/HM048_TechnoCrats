import express from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { closeAttendanceSession, createAttendanceSession, getMyAttendance, getSessionRecords, markAttendanceByQr } from "../controllers/attendance.controller.js";
import { validateAttendanceWithGeoFence, getGeoFenceStats, getNearbyGeoFences } from "../controllers/geofence.controller.js";

const router = express.Router();
router.post("/sessions", requireAuth, requireRole("teacher"), asyncHandler(createAttendanceSession));

router.post("/sessions/:id/close", requireAuth, requireRole("teacher"), asyncHandler(closeAttendanceSession));

router.post("/mark", requireAuth, requireRole("student"), asyncHandler(markAttendanceByQr));

router.get("/sessions/:id/records", requireAuth, requireRole("admin", "department", "teacher"), asyncHandler(getSessionRecords));

router.get("/me", requireAuth, requireRole("student"), asyncHandler(getMyAttendance));

// Geo-fence validation routes
router.post("/validate-geofence", requireAuth, asyncHandler(validateAttendanceWithGeoFence));

router.get("/sessions/:session_id/geofence-stats", requireAuth, requireRole("admin", "department", "teacher"), asyncHandler(getGeoFenceStats));

router.get("/nearby-geofences", requireAuth, asyncHandler(getNearbyGeoFences));

export default router;
