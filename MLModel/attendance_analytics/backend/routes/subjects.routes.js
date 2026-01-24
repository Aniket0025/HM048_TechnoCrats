import express from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createSubject, deleteSubject, listSubjects, updateSubject } from "../controllers/subjects.controller.js";

const router = express.Router();

router.get("/", requireAuth, asyncHandler(listSubjects));

router.post("/", requireAuth, requireRole("admin", "department"), asyncHandler(createSubject));

router.put("/:id", requireAuth, requireRole("admin", "department"), asyncHandler(updateSubject));

router.delete("/:id", requireAuth, requireRole("admin", "department"), asyncHandler(deleteSubject));

export default router;
