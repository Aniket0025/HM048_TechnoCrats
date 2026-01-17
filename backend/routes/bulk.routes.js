import express from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { bulkCourses, bulkEnrollments, bulkSubjects, bulkUsers } from "../controllers/bulk.controller.js";

const router = express.Router();

router.post("/users", requireAuth, requireRole("admin", "department"), asyncHandler(bulkUsers));

router.post("/subjects", requireAuth, requireRole("admin", "department"), asyncHandler(bulkSubjects));

router.post("/courses", requireAuth, requireRole("admin", "department"), asyncHandler(bulkCourses));

router.post("/enrollments", requireAuth, requireRole("admin", "department"), asyncHandler(bulkEnrollments));

export default router;
