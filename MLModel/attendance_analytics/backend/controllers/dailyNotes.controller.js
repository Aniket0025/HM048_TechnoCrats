import { DailyNote } from "../models/DailyNote.js";
import { Class } from "../models/Class.js";
import { User } from "../models/User.js";
import { exportExcalidrawToPNG, exportExcalidrawToPDF } from "../utils/excalidrawExport.js";

// Teacher: Save or update daily note for a class
export async function saveDailyNote(req, res) {
    const { classId, excalidrawData, excalidrawFiles, tags, isPublic } = req.body;

    const classDoc = await Class.findById(classId);
    if (!classDoc || String(classDoc.teacher) !== req.user.sub) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    const today = new Date().toISOString().slice(0, 10);
    const note = await DailyNote.findOneAndUpdate(
        { class: classId, date: new Date(today) },
        {
            teacher: req.user.sub,
            subject: classDoc.subject,
            batch: classDoc.batch,
            excalidrawData,
            excalidrawFiles,
            tags,
            isPublic,
        },
        { upsert: true, new: true }
    );

    // Generate thumbnail/PDF in background
    setImmediate(async () => {
        try {
            const thumbnailUrl = await exportExcalidrawToPNG(note._id, excalidrawData);
            const pdfUrl = await exportExcalidrawToPDF(note._id, excalidrawData);
            await DailyNote.findByIdAndUpdate(note._id, { thumbnailUrl, pdfUrl });
        } catch (e) {
            console.error("[Export] Failed:", e);
        }
    });

    res.json(note);
}

// Student/Teacher: List daily notes with filters
export async function listDailyNotes(req, res) {
    const { subject, batch, teacher, from, to } = req.query;
    const filter = {};

    if (subject) filter.subject = subject;
    if (batch) filter.batch = batch;
    if (teacher) filter.teacher = teacher;
    if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = new Date(from);
        if (to) filter.date.$lte = new Date(to);
    }

    // Students only see notes for their batches
    if (req.user.role === "student") {
        const student = await User.findById(req.user.sub).populate("batches");
        filter.batch = { $in: student.batches.map(b => b._id) };
    }

    const notes = await DailyNote.find(filter)
        .populate("teacher", "name email")
        .populate("subject", "name code")
        .populate("batch", "name")
        .sort({ date: -1 });

    res.json(notes);
}

// Get single note (read-only for students)
export async function getDailyNote(req, res) {
    const note = await DailyNote.findById(req.params.id)
        .populate("teacher", "name")
        .populate("subject", "name code")
        .populate("batch", "name");

    if (!note) return res.sendStatus(404);

    // Students can only view if they belong to the batch
    if (req.user.role === "student") {
        const student = await User.findById(req.user.sub);
        if (!student.batches.includes(note.batch._id)) {
            return res.sendStatus(403);
        }
    }

    res.json(note);
}

// Download PNG/PDF
export async function exportDailyNote(req, res) {
    const note = await DailyNote.findById(req.params.id);
    if (!note) return res.sendStatus(404);

    const { format } = req.params;
    if (format === "png" && note.thumbnailUrl) {
        return res.redirect(note.thumbnailUrl);
    }
    if (format === "pdf" && note.pdfUrl) {
        return res.redirect(note.pdfUrl);
    }
    res.sendStatus(404);
}
