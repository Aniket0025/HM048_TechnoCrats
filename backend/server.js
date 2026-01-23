import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { createServer } from "http";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";
import { initializeAttendanceSocket } from "./sockets/attendanceSocket.js";
import authRoutes from "./routes/auth.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import bulkRoutes from "./routes/bulk.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import marksRoutes from "./routes/marks.routes.js";
import subjectsRoutes from "./routes/subjects.routes.js";
import timetableRoutes from "./routes/timetable.routes.js";
import usersRoutes from "./routes/users.routes.js";
import dailyNotesRoutes from "./routes/dailyNotes.routes.js";
import classesRoutes from "./routes/classes.routes.js";
import geoFenceRoutes from "./routes/geofence.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import evaluationRoutes from "./routes/evaluation.routes.js";
import { performanceTracker } from "./middleware/performance.js";

dotenv.config({ path: ".env" });
if (!process.env.MONGODB_URI) {
    dotenv.config({ path: ".env.example" });
}

const app = express();

app.use(express.json({ limit: "1mb" }));

app.use(performanceTracker);

const frontendOrigin = process.env.FRONTEND_ORIGIN;
app.use(
    cors({
        origin: frontendOrigin || true,
        credentials: true,
    })
);

app.get("/api/health", (req, res) => {
    res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/bulk", bulkRoutes);
app.use("/api/daily-notes", dailyNotesRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/geofence", geoFenceRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/evaluations", evaluationRoutes);

app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
    const status = err?.statusCode || 500;
    res.status(status).json({ message: err?.message || "Server error" });
});

const port = Number(process.env.PORT || 5000);

async function start() {
    await connectDB();
    const httpServer = createServer(app);
    initializeAttendanceSocket(httpServer);
    httpServer.listen(port, () => {
        console.log(`🚀 Server running on http://localhost:${port}`);
        console.log(`🔌 Socket.IO enabled`);
    });
}

start().catch((err) => {
    console.error(err);
    process.exit(1);
});
