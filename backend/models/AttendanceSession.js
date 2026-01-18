import mongoose from "mongoose";

const attendanceSessionSchema = new mongoose.Schema(
    {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        timetableEntryId: { type: mongoose.Schema.Types.ObjectId, ref: "TimetableEntry" },
        date: { type: String, required: true, trim: true },
        startsAt: { type: Date, required: true },
        expiresAt: { type: Date, required: true },
        status: { type: String, enum: ["open", "closed"], default: "open" },
        qrToken: { type: String, required: true, trim: true },
        createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        notes: { type: String, trim: true },
    },
    { timestamps: true }
);

attendanceSessionSchema.index({ courseId: 1, date: 1 });

attendanceSessionSchema.index({ qrToken: 1 }, { unique: true });

attendanceSessionSchema.index({ status: 1, expiresAt: 1 });

export const AttendanceSession = mongoose.model("AttendanceSession", attendanceSessionSchema);
