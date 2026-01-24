import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
    createClass,
    getClass,
    getTodayNote,
    listClasses,
} from "../controllers/classes.controller.js";

const router = Router();

router.post("/", authenticateToken, requireRole("teacher"), createClass);
router.get("/", authenticateToken, listClasses);
router.get("/:id", authenticateToken, getClass);
router.get("/:id/today-note", authenticateToken, requireRole("teacher"), getTodayNote);

export default router;
