import express from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createTimetableEntry, deleteTimetableEntry, listTimetable } from "../controllers/timetable.controller.js";

const router = express.Router();

router.get("/", requireAuth, asyncHandler(listTimetable));

router.post("/", requireAuth, requireRole("admin", "department"), asyncHandler(createTimetableEntry));

router.delete("/:id", requireAuth, requireRole("admin", "department"), asyncHandler(deleteTimetableEntry));

export default router;
