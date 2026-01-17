import cors from "cors";
import "dotenv/config";
import express from "express";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

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

start().catch(() => {
    process.exit(1);
});
