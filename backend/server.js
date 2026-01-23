import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import bulkRoutes from "./routes/bulk.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import marksRoutes from "./routes/marks.routes.js";
import subjectsRoutes from "./routes/subjects.routes.js";
import timetableRoutes from "./routes/timetable.routes.js";
import usersRoutes from "./routes/users.routes.js";
import geoFenceRoutes from "./routes/geofence.routes.js";

dotenv.config({ path: ".env" });
if (!process.env.MONGODB_URI) {
    dotenv.config({ path: ".env.example" });
}

const app = express();

app.use(express.json({ limit: "1mb" }));

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
app.use("/api/geofence", geoFenceRoutes);

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
    app.listen(port);
}

start().catch((err) => {
    console.error(err);
    process.exit(1);
});
