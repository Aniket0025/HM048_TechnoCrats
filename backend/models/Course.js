import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
        teacherUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        department: { type: String, trim: true },
        semester: { type: Number },
        section: { type: String, trim: true },
        batchYear: { type: Number },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

courseSchema.index({ subjectId: 1, department: 1, semester: 1, section: 1, batchYear: 1 });

export const Course = mongoose.model("Course", courseSchema);
