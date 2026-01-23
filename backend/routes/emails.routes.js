import express from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { sendAnnouncementEmail, sendWelcomeEmail, testEmail } from "../controllers/emails.controller.js";

const router = express.Router();

router.post("/welcome", requireAuth, requireRole("admin", "department"), asyncHandler(sendWelcomeEmail));

router.post("/announcement", requireAuth, requireRole("admin", "department", "teacher"), asyncHandler(sendAnnouncementEmail));

router.post("/test", requireAuth, requireRole("admin"), asyncHandler(testEmail));

export default router;
