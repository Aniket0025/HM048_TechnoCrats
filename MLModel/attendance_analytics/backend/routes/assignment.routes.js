import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
    createAssignment,
    uploadAssignmentFile,
    addQuizQuestions,
    getTeacherAssignments,
    getStudentAssignments,
    getAssignmentDetails,
    publishAssignment,
    deleteAssignment,
} from "../controllers/assignment.controller.js";
import { uploadAssignmentFile as uploadMiddleware } from "../middleware/fileUpload.js";

const router = Router();

// Teacher routes
router.post("/", authenticateToken, requireRole("teacher"), createAssignment);
router.post("/upload-file", authenticateToken, requireRole("teacher"), uploadMiddleware, uploadAssignmentFile);
router.post("/add-questions", authenticateToken, requireRole("teacher"), addQuizQuestions);
router.get("/teacher", authenticateToken, requireRole("teacher"), getTeacherAssignments);
router.get("/:id", authenticateToken, getAssignmentDetails);
router.patch("/:id/publish", authenticateToken, requireRole("teacher"), publishAssignment);
router.delete("/:id", authenticateToken, requireRole("teacher"), deleteAssignment);

// Student routes
router.get("/student", authenticateToken, requireRole("student"), getStudentAssignments);

export default router;
