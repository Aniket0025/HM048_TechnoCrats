import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
    evaluateFileAssignment,
    evaluateQuizAssignment,
    getEvaluation,
    getAssignmentEvaluationStats,
} from "../controllers/evaluation.controller.js";

const router = Router();

// Teacher routes
router.post("/file/:submissionId", authenticateToken, requireRole("teacher"), evaluateFileAssignment);
router.post("/quiz/:submissionId", authenticateToken, requireRole("teacher"), evaluateQuizAssignment);
router.get("/stats/:assignmentId", authenticateToken, requireRole("teacher"), getAssignmentEvaluationStats);

// Both roles (for viewing results)
router.get("/submission/:submissionId", authenticateToken, getEvaluation);

export default router;
