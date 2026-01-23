import mongoose from "mongoose";

const dailyNoteSchema = new mongoose.Schema({
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    date: { type: Date, required: true }, // calendar date
    excalidrawData: { type: mongoose.Schema.Types.Mixed, required: true }, // JSON scene
    excalidrawFiles: [{ type: mongoose.Schema.Types.Mixed }], // embedded images/files
    thumbnailUrl: String, // PNG preview
    pdfUrl: String, // generated PDF
    tags: [String],
    isPublic: { type: Boolean, default: false },
}, { timestamps: true });

// Compound indexes for fast lookups
dailyNoteSchema.index({ subject: 1, date: -1 });
dailyNoteSchema.index({ batch: 1, date: -1 });
dailyNoteSchema.index({ teacher: 1, date: -1 });
dailyNoteSchema.index({ class: 1, date: -1 }, { unique: true });

export const DailyNote = mongoose.model("DailyNote", dailyNoteSchema);
