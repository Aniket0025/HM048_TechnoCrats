import mongoose from "mongoose";

const markSchema = new mongoose.Schema(
    {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        studentUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, required: true, trim: true },
        title: { type: String, required: true, trim: true },
        maxMarks: { type: Number, required: true },
        marks: { type: Number, required: true },
        gradedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        gradedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

markSchema.index({ courseId: 1, studentUserId: 1, type: 1, title: 1 }, { unique: true });

markSchema.index({ studentUserId: 1, courseId: 1 });

export const Mark = mongoose.model("Mark", markSchema);
