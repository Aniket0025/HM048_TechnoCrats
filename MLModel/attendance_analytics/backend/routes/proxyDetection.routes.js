import express from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
    listLogs,
    getLogById,
    updateLog,
    getDashboardStats,
    bulkUpdate,
    exportCsv,
} from "../controllers/proxyDetection.controller.js";

const router = express.Router();

router.get("/", requireAuth, requireRole("admin", "department", "teacher"), asyncHandler(listLogs));

router.get("/dashboard", requireAuth, requireRole("admin", "department", "teacher"), asyncHandler(getDashboardStats));

router.get("/export", requireAuth, requireRole("admin", "department"), asyncHandler(exportCsv));

router.get("/:id", requireAuth, requireRole("admin", "department", "teacher"), asyncHandler(getLogById));

router.patch("/:id", requireAuth, requireRole("admin", "department", "teacher"), asyncHandler(updateLog));

router.patch("/bulk", requireAuth, requireRole("admin", "department"), asyncHandler(bulkUpdate));

export default router;
