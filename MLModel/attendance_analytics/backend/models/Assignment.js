import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["FILE", "QUIZ"], required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, required: true, min: 0 },
    allowedFileTypes: [{ type: String }], // e.g., ["pdf", "docx", "zip"]
    maxFileSizeMB: { type: Number, default: 10 },
    allowResubmission: { type: Boolean, default: false },
    // Quiz-specific fields
    quizSettings: {
        timeLimitMinutes: { type: Number },
        shuffleQuestions: { type: Boolean, default: false },
        attemptLimit: { type: Number, default: 1 },
        showCorrectAnswers: { type: Boolean, default: false },
    },
    status: {
        type: String,
        enum: ["DRAFT", "PUBLISHED", "CLOSED"],
        default: "DRAFT",
    },
    publishedAt: Date,
}, { timestamps: true });

// Indexes for performance
assignmentSchema.index({ subject: 1, batch: 1, status: 1 });
assignmentSchema.index({ teacher: 1 });
assignmentSchema.index({ dueDate: 1 });

export const Assignment = mongoose.model("Assignment", assignmentSchema);
