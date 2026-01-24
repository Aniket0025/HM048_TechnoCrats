import express from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createAnnouncement, deleteAnnouncement, listAnnouncements, updateAnnouncement } from "../controllers/announcements.controller.js";

const router = express.Router();

router.get("/", requireAuth, asyncHandler(listAnnouncements));

router.post("/", requireAuth, requireRole("admin", "department", "teacher"), asyncHandler(createAnnouncement));

router.put("/:id", requireAuth, requireRole("admin", "department", "teacher"), asyncHandler(updateAnnouncement));

router.delete("/:id", requireAuth, requireRole("admin", "department", "teacher"), asyncHandler(deleteAnnouncement));

export default router;
