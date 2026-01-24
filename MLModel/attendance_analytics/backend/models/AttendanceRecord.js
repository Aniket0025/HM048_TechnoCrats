import mongoose from "mongoose";

const attendanceRecordSchema = new mongoose.Schema(
    {
        sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "AttendanceSession", required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        studentUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: ["present", "absent"], default: "present" },
        markedAt: { type: Date, default: Date.now },
        markedBy: { type: String, enum: ["student", "teacher", "system"], default: "student" },
    },
    { timestamps: true }
);

attendanceRecordSchema.index({ sessionId: 1, studentUserId: 1 }, { unique: true });

attendanceRecordSchema.index({ studentUserId: 1, courseId: 1 });

export const AttendanceRecord = mongoose.model("AttendanceRecord", attendanceRecordSchema);
