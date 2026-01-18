import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { me, signin, signup } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", asyncHandler(signup));

router.post("/signin", asyncHandler(signin));

router.get("/me", requireAuth, asyncHandler(me));

export default router;
