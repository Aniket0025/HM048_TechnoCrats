import jwt from "jsonwebtoken";

import { HttpError } from "../utils/HttpError.js";
import { User } from "../models/User.js";

function signToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new HttpError(500, "JWT_SECRET is not set");
    }

    return jwt.sign(
        { sub: user._id.toString(), email: user.email, role: user.role },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

export async function signup(req, res) {
    const { name, email, password, role, department, avatar } = req.body;

    if (!name || !email || !password) {
        throw new HttpError(400, "name, email and password are required");
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
        throw new HttpError(409, "Email already in use");
    }

    const user = await User.create({ name, email, password, role, department, avatar });
    const token = signToken(user);

    return res.status(201).json({ token, user });
}

export async function signin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new HttpError(400, "email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new HttpError(404, "User not found");
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
        throw new HttpError(401, "Invalid credentials");
    }

    const token = signToken(user);
    return res.json({ token, user });
}

export async function me(req, res) {
    const user = await User.findById(req.user.sub);
    if (!user) throw new HttpError(404, "Not found");
    return res.json({ user });
}
