import { Class } from "../models/Class.js";
import { DailyNote } from "../models/DailyNote.js";

// Create a new class
export async function createClass(req, res) {
    const { title, subject, batch, scheduledAt, duration } = req.body;
    const classDoc = await Class.create({
        title,
        subject,
        batch,
        teacher: req.user.sub,
        scheduledAt,
        duration,
    });
    res.status(201).json(classDoc);
}

// Get class details
export async function getClass(req, res) {
    const classDoc = await Class.findById(req.params.id)
        .populate("subject", "name code")
        .populate("batch", "name")
        .populate("teacher", "name email");
    if (!classDoc) return res.sendStatus(404);
    res.json(classDoc);
}

// Get today's note for a class (teacher only)
export async function getTodayNote(req, res) {
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc || String(classDoc.teacher) !== req.user.sub) {
        return res.status(403).json({ message: "Unauthorized" });
    }
    const today = new Date().toISOString().slice(0, 10);
    const note = await DailyNote.findOne({
        class: req.params.id,
        date: new Date(today),
    }).populate("teacher", "name");
    res.json(note);
}

// List classes for teacher/student
export async function listClasses(req, res) {
    const filter = {};
    if (req.user.role === "teacher") {
        filter.teacher = req.user.sub;
    } else if (req.user.role === "student") {
        // Student sees classes for their batches
        const { User } = await import("../models/User.js");
        const student = await User.findById(req.user.sub).populate("batches");
        filter.batch = { $in: student.batches.map(b => b._id) };
    }
    const classes = await Class.find(filter)
        .populate("subject", "name code")
        .populate("batch", "name")
        .populate("teacher", "name")
        .sort({ scheduledAt: -1 });
    res.json(classes);
}
