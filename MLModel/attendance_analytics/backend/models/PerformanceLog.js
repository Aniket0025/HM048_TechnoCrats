import mongoose from "mongoose";

const performanceLogSchema = new mongoose.Schema(
    {
        method: { type: String, required: true },
        url: { type: String, required: true },
        statusCode: { type: Number, required: true },
        durationMs: { type: Number, required: true },
        ip: { type: String, trim: true },
        userAgent: { type: String, trim: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, trim: true },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

performanceLogSchema.index({ timestamp: -1 });
performanceLogSchema.index({ userId: 1, timestamp: -1 });

export const PerformanceLog = mongoose.model("PerformanceLog", performanceLogSchema);
