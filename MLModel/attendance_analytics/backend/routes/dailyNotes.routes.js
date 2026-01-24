import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
    saveDailyNote,
    listDailyNotes,
    getDailyNote,
    exportDailyNote,
} from "../controllers/dailyNotes.controller.js";

const router = Router();

router.post("/", authenticateToken, requireRole("teacher"), saveDailyNote);
router.get("/", authenticateToken, listDailyNotes);
router.get("/:id", authenticateToken, getDailyNote);
router.get("/:id/export/:format", authenticateToken, exportDailyNote);

export default router;
