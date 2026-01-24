import { HttpError } from "../utils/HttpError.js";
import { User } from "../models/User.js";

export async function listUsers(req, res) {
    const { role, department } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;

    const users = await User.find(filter)
        .select("name email role department avatar createdAt")
        .sort({ createdAt: -1 });
    return res.json({ users });
}

export async function getMe(req, res) {
    const user = await User.findById(req.user.sub);
    if (!user) throw new HttpError(404, "Not found");
    return res.json({ user });
}
