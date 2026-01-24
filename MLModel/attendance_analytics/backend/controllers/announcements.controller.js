import { HttpError } from "../utils/HttpError.js";
import { Announcement } from "../models/Announcement.js";

export async function listAnnouncements(req, res) {
    const { role, department } = req.query;
    const userRole = req.user.role;

    const filter = { isActive: true };
    if (role) filter.role = role;
    if (department) filter.department = department;

    if (userRole === "student") {
        filter.role = { $in: ["student"] };
    } else if (userRole === "teacher") {
        filter.role = { $in: ["teacher", "student"] };
    }

    const items = await Announcement.find(filter)
        .populate("authorId", "name email")
        .sort({ createdAt: -1 });

    return res.json({ announcements: items });
}

export async function createAnnouncement(req, res) {
    const { title, body, role, department, attachments, expiresAt } = req.body;

    if (!title || !body || !role) {
        throw new HttpError(400, "title, body, and role are required");
    }

    const announcement = await Announcement.create({
        title,
        body,
        authorId: req.user.sub,
        role,
        department,
        attachments: attachments || [],
        expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    await announcement.populate("authorId", "name email");

    return res.status(201).json({ announcement });
}

export async function updateAnnouncement(req, res) {
    const { id } = req.params;
    const { title, body, role, department, attachments, isActive, expiresAt } = req.body;

    const update = {};
    if (title !== undefined) update.title = title;
    if (body !== undefined) update.body = body;
    if (role !== undefined) update.role = role;
    if (department !== undefined) update.department = department;
    if (attachments !== undefined) update.attachments = attachments;
    if (isActive !== undefined) update.isActive = isActive;
    if (expiresAt !== undefined) update.expiresAt = new Date(expiresAt);

    const announcement = await Announcement.findByIdAndUpdate(id, update, { new: true }).populate(
        "authorId",
        "name email"
    );

    if (!announcement) throw new HttpError(404, "Not found");

    return res.json({ announcement });
}

export async function deleteAnnouncement(req, res) {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) throw new HttpError(404, "Not found");

    return res.json({ ok: true });
}
