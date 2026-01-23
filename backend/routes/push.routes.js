import express from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { sendPush, subscribe, unsubscribe } from "../controllers/push.controller.js";

const router = express.Router();

router.post("/subscribe", requireAuth, asyncHandler(subscribe));

router.post("/unsubscribe", requireAuth, asyncHandler(unsubscribe));

router.post("/send", requireAuth, requireRole("admin", "department", "teacher"), asyncHandler(sendPush));

export default router;
