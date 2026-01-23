import { HttpError } from "../utils/HttpError.js";
import { ProxyDetectionLog } from "../models/ProxyDetectionLog.js";
import { getStats } from "../utils/proxyDetection.js";

export async function listLogs(req, res) {
    const {
        limit = 100,
        offset = 0,
        status,
        violationType,
        studentIdentifier,
        sessionId,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (violationType) filter.violationType = violationType;
    if (studentIdentifier) filter.studentIdentifier = new RegExp(studentIdentifier, "i");
    if (sessionId) filter.sessionId = sessionId;

    const logs = await ProxyDetectionLog.find(filter)
        .populate("studentId", "name email")
        .populate("sessionId", "courseId date")
        .sort({ timestamp: -1 })
        .limit(Number(limit))
        .skip(Number(offset));

    const total = await ProxyDetectionLog.countDocuments(filter);

    return res.json({ logs, total });
}

export async function getLogById(req, res) {
    const { id } = req.params;

    const log = await ProxyDetectionLog.findById(id)
        .populate("studentId", "name email")
        .populate("sessionId", "courseId date")
        .populate("attendanceRecordId");

    if (!log) throw new HttpError(404, "Log not found");

    return res.json({ log });
}

export async function updateLog(req, res) {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    if (!["flagged", "reviewed", "cleared", "confirmed"].includes(status)) {
        throw new HttpError(400, "Invalid status");
    }

    const update = { status };
    if (reviewNotes !== undefined) update.reviewNotes = reviewNotes;
    update.reviewedBy = req.user.email;

    const log = await ProxyDetectionLog.findByIdAndUpdate(id, update, { new: true })
        .populate("studentId", "name email")
        .populate("sessionId", "courseId date");

    if (!log) throw new HttpError(404, "Log not found");

    return res.json({ log });
}

export async function getDashboardStats(req, res) {
    const stats = await getStats();

    // Additional aggregations for UI
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = await ProxyDetectionLog.find({ timestamp: { $gte: last7Days } })
        .populate("studentId", "name email")
        .sort({ timestamp: -1 })
        .limit(20);

    return res.json({ ...stats, recent });
}

export async function bulkUpdate(req, res) {
    const { ids, status, reviewNotes } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        throw new HttpError(400, "ids must be a non‑empty array");
    }

    if (!["cleared", "confirmed", "reviewed"].includes(status)) {
        throw new HttpError(400, "Invalid bulk status");
    }

    const update = { status, reviewedBy: req.user.email };
    if (reviewNotes !== undefined) update.reviewNotes = reviewNotes;

    const result = await ProxyDetectionLog.updateMany(
        { _id: { $in: ids } },
        update
    );

    return res.json({ updatedCount: result.modifiedCount });
}

export async function exportCsv(req, res) {
    const { status, violationType, startDate, endDate } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (violationType) filter.violationType = violationType;
    if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = new Date(startDate);
        if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await ProxyDetectionLog.find(filter)
        .populate("studentId", "name email")
        .populate("sessionId", "courseId date")
        .sort({ timestamp: -1 });

    const csv = [
        "Timestamp,Student ID,Student Name,Email,Violation Type,Risk Score,Status,Details,IP,Device Fingerprint",
        ...logs.map(log =>
            [
                log.timestamp.toISOString(),
                log.studentIdentifier,
                log.studentId?.name || "",
                log.studentId?.email || "",
                log.violationType,
                log.riskScore,
                log.status,
                `"${log.details.replace(/"/g, '""')}"`,
                log.ipAddress || "",
                log.deviceFingerprint || "",
            ].join(",")
        ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=proxy-detection-logs.csv");
    return res.send(csv);
}
