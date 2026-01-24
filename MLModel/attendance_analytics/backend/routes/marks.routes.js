import express from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { bulkUpsertMarks, getCourseMarks, getMyMarks, upsertMark } from "../controllers/marks.controller.js";

const router = express.Router();

router.post("/", requireAuth, requireRole("teacher"), asyncHandler(upsertMark));

router.post("/bulk", requireAuth, requireRole("teacher"), asyncHandler(bulkUpsertMarks));

router.get("/me", requireAuth, requireRole("student"), asyncHandler(getMyMarks));

router.get("/course/:courseId", requireAuth, requireRole("admin", "department", "teacher"), asyncHandler(getCourseMarks));

export default router;
