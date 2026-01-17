import mongoose from "mongoose";

const timetableEntrySchema = new mongoose.Schema(
    {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
        startTime: { type: String, required: true, trim: true },
        endTime: { type: String, required: true, trim: true },
        room: { type: String, trim: true },
        createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

timetableEntrySchema.index({ courseId: 1, dayOfWeek: 1, startTime: 1, endTime: 1 }, { unique: true });

timetableEntrySchema.index({ dayOfWeek: 1 });

export const TimetableEntry = mongoose.model("TimetableEntry", timetableEntrySchema);
