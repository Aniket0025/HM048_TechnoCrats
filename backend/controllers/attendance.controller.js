import crypto from "crypto";

import { HttpError } from "../utils/HttpError.js";
import { AttendanceSession } from "../models/AttendanceSession.js";
import { AttendanceRecord } from "../models/AttendanceRecord.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { User } from "../models/User.js";
import { runProxyDetection } from "../utils/proxyDetection.js";

function todayISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export async function createAttendanceSession(req, res) {
    const { courseId, timetableEntryId, date, durationMinutes } = req.body;

    if (!courseId) throw new HttpError(400, "courseId is required");

    const course = await Course.findById(courseId);
    if (!course) throw new HttpError(404, "Course not found");

    if (String(course.teacherUserId || "") !== String(req.user.sub)) {
        throw new HttpError(403, "Forbidden");
    }

    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + Number(durationMinutes || 10) * 60 * 1000);

    for (let attempt = 0; attempt < 3; attempt++) {
        const qrToken = crypto.randomBytes(18).toString("hex");

        try {
            const session = await AttendanceSession.create({
                courseId,
                timetableEntryId,
                date: (date || todayISO()).trim(),
                startsAt,
                expiresAt,
                status: "open",
                qrToken,
                createdByUserId: req.user.sub,
            });

            return res.status(201).json({ session });
        } catch (e) {
            if (String(e?.code) === "11000") continue;
            throw e;
        }
    }

    throw new HttpError(500, "Could not generate QR token");
}

export async function closeAttendanceSession(req, res) {
    const { id } = req.params;

    const session = await AttendanceSession.findById(id);
    if (!session) throw new HttpError(404, "Not found");

    const course = await Course.findById(session.courseId);
    if (!course) throw new HttpError(404, "Course not found");

    if (String(course.teacherUserId || "") !== String(req.user.sub)) {
        throw new HttpError(403, "Forbidden");
    }

    session.status = "closed";
    await session.save();

    return res.json({ session });
}

export async function markAttendanceByQr(req, res) {
    const { qrToken, gpsLat, gpsLng, gpsAccuracy } = req.body;

    if (!qrToken) throw new HttpError(400, "qrToken is required");

    const now = new Date();
    const session = await AttendanceSession.findOne({ qrToken, status: "open", expiresAt: { $gt: now } });
    if (!session) throw new HttpError(404, "Invalid or expired QR");

    const enrolled = await Enrollment.findOne({ courseId: session.courseId, studentUserId: req.user.sub, status: "active" });
    if (!enrolled) throw new HttpError(403, "Not enrolled");

    const record = await AttendanceRecord.create({
        sessionId: session._id,
        courseId: session.courseId,
        studentUserId: req.user.sub,
        status: "present",
        markedBy: "student",
        markedAt: new Date(),
    }).catch((e) => {
        if (String(e?.code) === "11000") return null;
        throw e;
    });

    if (!record) return res.json({ ok: true, alreadyMarked: true });

    // Run proxy detection in background (don’t block response)
    const student = await User.findById(req.user.sub, "name email");
    setImmediate(async () => {
        try {
            await runProxyDetection({
                sessionId: session._id,
                studentId: req.user.sub,
                studentIdentifier: student.email,
                gpsLat,
                gpsLng,
                gpsAccuracy,
                req,
                attendanceRecordId: record._id,
            });
        } catch (e) {
            console.error("[ProxyDetection] Background check failed:", e);
        }
    });

    return res.status(201).json({ record });
}

export async function getSessionRecords(req, res) {
    const { id } = req.params;

    const session = await AttendanceSession.findById(id);
    if (!session) throw new HttpError(404, "Not found");

    if (req.user.role === "teacher") {
        const course = await Course.findById(session.courseId);
        if (!course) throw new HttpError(404, "Course not found");
        if (String(course.teacherUserId || "") !== String(req.user.sub)) {
            throw new HttpError(403, "Forbidden");
        }
    }

    const records = await AttendanceRecord.find({ sessionId: id }).populate("studentUserId", "name email department");
    return res.json({ records });
}

export async function getMyAttendance(req, res) {
    const records = await AttendanceRecord.find({ studentUserId: req.user.sub }).populate({
        path: "courseId",
        populate: [{ path: "subjectId" }, { path: "teacherUserId", select: "name email" }],
    });
    return res.json({ records });
}
