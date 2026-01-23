import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
    submitFileAssignment,
    submitQuizAssignment,
    getStudentSubmissions,
    getAssignmentSubmissions,
} from "../controllers/submission.controller.js";
import { uploadSubmissionFile as uploadMiddleware } from "../middleware/fileUpload.js";

const router = Router();

// Student routes
router.post("/file", authenticateToken, requireRole("student"), uploadMiddleware, submitFileAssignment);
router.post("/quiz", authenticateToken, requireRole("student"), submitQuizAssignment);
router.get("/student", authenticateToken, requireRole("student"), getStudentSubmissions);

// Teacher routes
router.get("/assignment/:assignmentId", authenticateToken, requireRole("teacher"), getAssignmentSubmissions);

export default router;
