import express from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getMe, listUsers } from "../controllers/users.controller.js";

const router = express.Router();

router.get("/", requireAuth, requireRole("admin", "department", "teacher"), asyncHandler(listUsers));

router.get("/me", requireAuth, asyncHandler(getMe));

export default router;
