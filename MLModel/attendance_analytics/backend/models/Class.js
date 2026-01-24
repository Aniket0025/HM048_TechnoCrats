import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    scheduledAt: Date,
    duration: Number, // minutes
    status: { type: String, enum: ["scheduled", "live", "ended"], default: "scheduled" },
}, { timestamps: true });

export const Class = mongoose.model("Class", classSchema);
