import mongoose from "mongoose";

const proxyDetectionLogSchema = new mongoose.Schema(
    {
        sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "AttendanceSession", required: true },
        attendanceRecordId: { type: mongoose.Schema.Types.ObjectId, ref: "AttendanceRecord" },
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        studentIdentifier: { type: String, required: true, trim: true }, // PRN/Roll No
        ipAddress: { type: String, trim: true },
        userAgent: { type: String, trim: true },
        deviceFingerprint: { type: String, trim: true },
        gpsLat: { type: Number },
        gpsLng: { type: Number },
        gpsAccuracy: { type: Number },
        timestamp: { type: Date, default: Date.now },
        violationType: {
            type: String,
            enum: [
                "outside_geofence",
                "duplicate_device",
                "duplicate_prn",
                "gps_spoofing_suspected",
                "impossible_travel",
                "low_gps_accuracy",
                "multiple_prns_same_device",
                "ml_high_risk",
            ],
            required: true,
        },
        riskScore: { type: Number, min: 0, max: 100, required: true },
        details: { type: String, required: true, trim: true },
        distanceFromGeofence: { type: Number },
        status: {
            type: String,
            enum: ["flagged", "reviewed", "cleared", "confirmed"],
            default: "flagged",
        },
        reviewedBy: { type: String, trim: true },
        reviewNotes: { type: String, trim: true },
        mlProbability: { type: Number, min: 0, max: 1 },
    },
    { timestamps: true }
);

proxyDetectionLogSchema.index({ sessionId: 1, studentId: 1 });
proxyDetectionLogSchema.index({ studentIdentifier: 1, timestamp: -1 });
proxyDetectionLogSchema.index({ status: 1, timestamp: -1 });
proxyDetectionLogSchema.index({ violationType: 1, timestamp: -1 });
proxyDetectionLogSchema.index({ deviceFingerprint: 1, timestamp: -1 });

export const ProxyDetectionLog = mongoose.model("ProxyDetectionLog", proxyDetectionLogSchema);
