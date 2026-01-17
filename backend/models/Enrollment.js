import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
    {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        studentUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true }
);

enrollmentSchema.index({ courseId: 1, studentUserId: 1 }, { unique: true });

enrollmentSchema.index({ studentUserId: 1 });

enrollmentSchema.index({ courseId: 1 });

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
