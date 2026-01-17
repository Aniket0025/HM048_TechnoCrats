import express from "express";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";

const router = express.Router();

function signToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not set");
    }

    return jwt.sign(
        { sub: user._id.toString(), email: user.email, role: user.role },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required" });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ message: "Email already in use" });
        }

        const user = await User.create({ name, email, password, role });
        const token = signToken(user);

        return res.status(201).json({ token, user });
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
});

router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const ok = await user.comparePassword(password);
        if (!ok) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = signToken(user);
        return res.json({ token, user });
    } catch {
        return res.status(500).json({ message: "Server error" });
    }
});

router.get("/me", requireAuth, async (req, res) => {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ message: "Not found" });
    return res.json({ user });
});

export default router;
