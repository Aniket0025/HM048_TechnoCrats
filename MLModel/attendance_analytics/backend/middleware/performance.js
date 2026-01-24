export function performanceTracker(req, res, next) {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1e6;

        const log = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Math.round(durationMs * 100) / 100,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
            userId: req.user?.sub || null,
            role: req.user?.role || null,
            timestamp: new Date().toISOString(),
        };

        if (process.env.NODE_ENV === "development") {
            console.log("[PERF]", JSON.stringify(log));
        }

        if (process.env.LOG_PERFORMANCE_TO_DB === "true") {
            // Optional: store in MongoDB if you want
            import("../models/PerformanceLog.js")
                .then(({ PerformanceLog }) => PerformanceLog.create(log))
                .catch(() => {});
        }
    });

    next();
}
