import { Server } from "socket.io";
import { runProxyDetection } from "../utils/proxyDetection.js";
import { AttendanceSession } from "../models/AttendanceSession.js";
import { AttendanceRecord } from "../models/AttendanceRecord.js";
import { Enrollment } from "../models/Enrollment.js";
import { User } from "../models/User.js";

export function initializeAttendanceSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: { origin: process.env.FRONTEND_ORIGIN || "*" },
    });

    // Store active sessions and their connected students/teachers
    const sessionMap = new Map(); // sessionId => Set of socketIds
    const socketToUser = new Map(); // socketId => {userId, role, sessionId}

    io.on("connection", (socket) => {
        console.log("[Socket] Connected:", socket.id);

        // Teacher creates or joins a session
        socket.on("join-session", async ({ sessionId, userId, role }) => {
            try {
                const session = await AttendanceSession.findById(sessionId);
                if (!session) {
                    socket.emit("error", { message: "Session not found" });
                    return;
                }

                // Verify teacher if role is teacher
                if (role === "teacher") {
                    const { Course } = await import("../models/Course.js");
                    const course = await Course.findById(session.courseId);
                    if (!course || String(course.teacherUserId) !== userId) {
                        socket.emit("error", { message: "Not authorized" });
                        return;
                    }
                }

                socket.join(`session:${sessionId}`);
                socketToUser.set(socket.id, { userId, role, sessionId });

                if (!sessionMap.has(sessionId)) sessionMap.set(sessionId, new Set());
                sessionMap.get(sessionId).add(socket.id);

                socket.emit("joined-session", { sessionId });
                io.to(`session:${sessionId}`).emit("user-joined", { userId, role });
            } catch (e) {
                socket.emit("error", { message: e.message });
            }
        });

        // Student marks attendance via QR
        socket.on("mark-attendance", async ({ qrToken, gpsLat, gpsLng, gpsAccuracy }) => {
            try {
                const now = new Date();
                const session = await AttendanceSession.findOne({ qrToken, status: "open", expiresAt: { $gt: now } });
                if (!session) {
                    socket.emit("attendance-error", { message: "Invalid or expired QR" });
                    return;
                }

                const enrolled = await Enrollment.findOne({ courseId: session.courseId, studentUserId: socketToUser.get(socket.id)?.userId, status: "active" });
                if (!enrolled) {
                    socket.emit("attendance-error", { message: "Not enrolled" });
                    return;
                }

                const userId = socketToUser.get(socket.id)?.userId;
                const record = await AttendanceRecord.create({
                    sessionId: session._id,
                    courseId: session.courseId,
                    studentUserId: userId,
                    status: "present",
                    markedBy: "student",
                    markedAt: new Date(),
                }).catch((e) => {
                    if (String(e?.code) === "11000") return null;
                    throw e;
                });

                if (!record) {
                    socket.emit("attendance-error", { message: "Already marked" });
                    return;
                }

                // Run proxy detection in background
                const student = await User.findById(userId, "name email");
                setImmediate(async () => {
                    try {
                        await runProxyDetection({
                            sessionId: session._id,
                            studentId: userId,
                            studentIdentifier: student.email,
                            gpsLat,
                            gpsLng,
                            gpsAccuracy,
                            req: { ip: socket.handshake.address, headers: socket.handshake.headers },
                            attendanceRecordId: record._id,
                        });
                    } catch (e) {
                        console.error("[ProxyDetection] Background check failed:", e);
                    }
                });

                socket.emit("attendance-success", { record });
                io.to(`session:${session._id}`).emit("attendance-marked", {
                    studentId: userId,
                    studentName: student.name,
                    timestamp: record.markedAt,
                });
            } catch (e) {
                socket.emit("attendance-error", { message: e.message });
            }
        });

        // Teacher closes session
        socket.on("close-session", async ({ sessionId }) => {
            try {
                const session = await AttendanceSession.findById(sessionId);
                if (!session) {
                    socket.emit("error", { message: "Session not found" });
                    return;
                }

                const { Course } = await import("../models/Course.js");
                const course = await Course.findById(session.courseId);
                if (!course || String(course.teacherUserId) !== socketToUser.get(socket.id)?.userId) {
                    socket.emit("error", { message: "Not authorized" });
                    return;
                }

                session.status = "closed";
                await session.save();

                io.to(`session:${sessionId}`).emit("session-closed", { sessionId });
            } catch (e) {
                socket.emit("error", { message: e.message });
            }
        });

        socket.on("disconnect", () => {
            console.log("[Socket] Disconnected:", socket.id);
            const info = socketToUser.get(socket.id);
            if (info) {
                const set = sessionMap.get(info.sessionId);
                if (set) set.delete(socket.id);
                socketToUser.delete(socket.id);
                io.to(`session:${info.sessionId}`).emit("user-left", { userId: info.userId, role: info.role });
            }
        });
    });

    return io;
}
