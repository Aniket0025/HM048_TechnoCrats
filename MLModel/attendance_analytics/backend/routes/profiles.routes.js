import express from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getMyProfile, updateMyProfile, getProfileByUserId } from "../controllers/profiles.controller.js";

const router = express.Router();

router.get("/me", requireAuth, asyncHandler(getMyProfile));

router.patch("/me", requireAuth, asyncHandler(updateMyProfile));

router.get("/:userId", requireAuth, requireRole("admin", "department", "teacher"), asyncHandler(getProfileByUserId));

export default router;
