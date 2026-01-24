import { HttpError } from "../utils/HttpError.js";
import { PushSubscription } from "../models/PushSubscription.js";
import webpush from "web-push";

function getVapidKeys() {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;

    if (!publicKey || !privateKey || !subject) {
        throw new HttpError(500, "VAPID keys not configured");
    }

    return { publicKey, privateKey, subject };
}

export async function subscribe(req, res) {
    const { endpoint, keys } = req.body;
    const userAgent = req.headers["user-agent"];

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
        throw new HttpError(400, "endpoint and keys (p256dh, auth) are required");
    }

    await PushSubscription.findOneAndUpdate(
        { userId: req.user.sub, endpoint },
        {
            userId: req.user.sub,
            endpoint,
            keys,
            userAgent,
            isActive: true,
        },
        { upsert: true, new: true }
    );

    return res.json({ ok: true });
}

export async function unsubscribe(req, res) {
    const { endpoint } = req.body;

    if (!endpoint) throw new HttpError(400, "endpoint is required");

    const result = await PushSubscription.updateOne(
        { userId: req.user.sub, endpoint },
        { isActive: false }
    );

    return res.json({ ok: true, modified: result.modifiedCount });
}

export async function sendPush(req, res) {
    const { title, body, icon, data, targetRole, targetDepartment } = req.body;

    if (!title || !body) {
        throw new HttpError(400, "title and body are required");
    }

    const { publicKey, privateKey, subject } = getVapidKeys();
    webpush.setVapidDetails(subject, publicKey, privateKey);

    const filter = { isActive: true };
    if (targetRole) {
        const { User } = await import("../models/User.js");
        const users = await User.find({ role: targetRole }).select("_id");
        filter.userId = { $in: users.map((u) => u._id) };
    }
    if (targetDepartment) {
        const { User } = await import("../models/User.js");
        const users = await User.find({ department: targetDepartment }).select("_id");
        filter.userId = { $in: users.map((u) => u._id) };
    }

    const subscriptions = await PushSubscription.find(filter);

    const payload = JSON.stringify({
        title,
        body,
        icon: icon || "/icon-192x192.png",
        data: data || {},
    });

    const results = [];
    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: sub.keys,
                },
                payload
            );
            results.push({ endpoint: sub.endpoint, status: "sent" });
        } catch (e) {
            results.push({ endpoint: sub.endpoint, status: "failed", error: e.message });
        }
    }

    return res.json({ ok: true, sent: results.filter((r) => r.status === "sent").length, results });
}
