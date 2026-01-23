import { ProxyDetectionLog } from "../models/ProxyDetectionLog.js";
import { AttendanceRecord } from "../models/AttendanceRecord.js";
import { User } from "../models/User.js";
import { predictProxy } from "./mlProxy.js";

const DEFAULT_GEOFENCE_CENTER = { lat: 28.6139, lng: 77.2090 }; // New Delhi
const DEFAULT_GEOFENCE_RADIUS_METERS = 500;

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(p1) * Math.cos(p2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function hashDeviceFingerprint(req) {
    const ua = req.headers["user-agent"] || "";
    const ip = req.ip || req.connection.remoteAddress || "";
    const lang = req.headers["accept-language"] || "";
    return Buffer.from(`${ua}|${ip}|${lang}`).toString("base64").slice(0, 32);
}

async function detectViolations({
    sessionId,
    studentId,
    studentIdentifier,
    gpsLat,
    gpsLng,
    gpsAccuracy,
    req,
}) {
    const violations = [];
    const ip = req.ip || req.connection.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";
    const deviceFingerprint = hashDeviceFingerprint(req);

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // 1) Geofence check
    if (gpsLat != null && gpsLng != null) {
        const centerLat = Number(process.env.GEOFENCE_LAT) || DEFAULT_GEOFENCE_CENTER.lat;
        const centerLng = Number(process.env.GEOFENCE_LNG) || DEFAULT_GEOFENCE_CENTER.lng;
        const radius = Number(process.env.GEOFENCE_RADIUS_METERS) || DEFAULT_GEOFENCE_RADIUS_METERS;

        const distance = getDistanceFromLatLonInMeters(centerLat, centerLng, gpsLat, gpsLng);
        if (distance > radius) {
            violations.push({
                type: "outside_geofence",
                riskScore: Math.min(90, 50 + (distance - radius) / 10),
                details: `Location ${Math.round(distance)}m outside allowed zone (max ${radius}m)`,
                distanceFromGeofence: distance,
            });
        }

        // 2) Low GPS accuracy
        if (gpsAccuracy && gpsAccuracy > 100) {
            violations.push({
                type: "low_gps_accuracy",
                riskScore: Math.min(40, gpsAccuracy / 5),
                details: `GPS accuracy too low: ±${Math.round(gpsAccuracy)}m`,
            });
        }
    }

    // 3) Duplicate device (same device used for multiple PRNs in last hour)
    const recentSameDevice = await ProxyDetectionLog.find({
        deviceFingerprint,
        timestamp: { $gte: oneHourAgo },
        studentId: { $ne: studentId },
    }).distinct("studentId");
    if (recentSameDevice.length >= 2) {
        violations.push({
            type: "multiple_prns_same_device",
            riskScore: 85,
            details: `Same device used for ${recentSameDevice.length + 1} different PRNs in last hour`,
        });
    }

    // 4) Duplicate PRN (same student from different devices in last hour)
    const recentSameStudent = await ProxyDetectionLog.find({
        studentId,
        timestamp: { $gte: oneHourAgo },
        deviceFingerprint: { $ne: deviceFingerprint },
    });
    if (recentSameStudent.length >= 1) {
        violations.push({
            type: "duplicate_prn",
            riskScore: 80,
            details: `Same PRN used from ${recentSameStudent.length + 1} devices in last hour`,
        });
    }

    // 5) Impossible travel (two locations far apart in short time)
    const lastLocation = await ProxyDetectionLog.findOne({
        studentId,
        gpsLat: { $ne: null },
        gpsLng: { $ne: null },
        timestamp: { $gte: oneHourAgo },
    }).sort({ timestamp: -1 });

    if (lastLocation && gpsLat != null && gpsLng != null) {
        const distance = getDistanceFromLatLonInMeters(
            lastLocation.gpsLat,
            lastLocation.gpsLng,
            gpsLat,
            gpsLng
        );
        const timeDiffMs = now - lastLocation.timestamp;
        const speedMs = distance / timeDiffMs;
        const speedKmh = (speedMs * 3.6).toFixed(1);
        if (speedKmh > 200) {
            violations.push({
                type: "impossible_travel",
                riskScore: Math.min(95, 50 + speedKmh / 10),
                details: `Impossible travel: ${speedKmh} km/h between locations`,
            });
        }
    }

    // 6) ML-based risk
    let mlProb = null;
    try {
        mlProb = await predictProxy({
            ip,
            userAgent,
            gpsLat,
            gpsLng,
            gpsAccuracy,
            hour: now.getHours(),
            dayOfWeek: now.getDay(),
            deviceFingerprint,
        });
        if (mlProb > 0.7) {
            violations.push({
                type: "ml_high_risk",
                riskScore: Math.round(mlProb * 100),
                details: `ML model predicts proxy probability ${(mlProb * 100).toFixed(1)}%`,
            });
        }
    } catch (e) {
        // ignore ML failures
    }

    return violations.map(v => ({
        ...v,
        sessionId,
        studentId,
        studentIdentifier,
        ipAddress: ip,
        userAgent,
        deviceFingerprint,
        gpsLat,
        gpsLng,
        gpsAccuracy,
        timestamp: now,
        mlProbability: mlProb,
    }));
}

export async function runProxyDetection({
    sessionId,
    studentId,
    studentIdentifier,
    gpsLat,
    gpsLng,
    gpsAccuracy,
    req,
    attendanceRecordId,
}) {
    const violations = await detectViolations({
        sessionId,
        studentId,
        studentIdentifier,
        gpsLat,
        gpsLng,
        gpsAccuracy,
        req,
    });

    if (violations.length === 0) return [];

    const created = await ProxyDetectionLog.insertMany(
        violations.map(v => ({
            ...v,
            attendanceRecordId,
        }))
    );

    return created;
}

export async function getStats() {
    const total = await ProxyDetectionLog.countDocuments();
    const byStatus = await ProxyDetectionLog.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const byType = await ProxyDetectionLog.aggregate([
        { $group: { _id: "$violationType", count: { $sum: 1 } } },
    ]);
    const recent = await ProxyDetectionLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate("studentId", "name email")
        .lean();

    return {
        total,
        byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
        byType: Object.fromEntries(byType.map(t => [t._id, t.count])),
        recent,
    };
}
