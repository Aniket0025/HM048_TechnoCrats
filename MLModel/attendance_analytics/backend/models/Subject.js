import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, trim: true, uppercase: true },
        name: { type: String, required: true, trim: true },
        department: { type: String, trim: true },
        semester: { type: Number },
    },
    { timestamps: true }
);

subjectSchema.index({ code: 1 }, { unique: true });

export const Subject = mongoose.model("Subject", subjectSchema);
