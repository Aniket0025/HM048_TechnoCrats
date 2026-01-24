import express from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { assignTeacher, createCourse, enrollStudents, listCourses, listCourseStudents } from "../controllers/courses.controller.js";

const router = express.Router();

router.get("/", requireAuth, asyncHandler(listCourses));

router.post("/", requireAuth, requireRole("admin", "department"), asyncHandler(createCourse));

router.patch("/:id/assign-teacher", requireAuth, requireRole("admin", "department"), asyncHandler(assignTeacher));

router.post("/:id/enroll", requireAuth, requireRole("admin", "department", "teacher"), asyncHandler(enrollStudents));

router.get("/:id/students", requireAuth, requireRole("admin", "department", "teacher"), asyncHandler(listCourseStudents));

export default router;
