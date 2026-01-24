import { HttpError } from "../utils/HttpError.js";
import { User } from "../models/User.js";
import { Announcement } from "../models/Announcement.js";
import { sendMail, renderAnnouncementEmail, renderWelcomeEmail } from "../utils/mailer.js";

export async function sendWelcomeEmail(req, res) {
    const { userId } = req.body;

    if (!userId) throw new HttpError(400, "userId is required");

    const user = await User.findById(userId);
    if (!user) throw new HttpError(404, "User not found");

    const { html, text } = renderWelcomeEmail(user);
    await sendMail({ to: user.email, subject: "Welcome to EduSync", html, text });

    return res.json({ ok: true });
}

export async function sendAnnouncementEmail(req, res) {
    const { announcementId, targetRole, targetDepartment } = req.body;

    if (!announcementId) throw new HttpError(400, "announcementId is required");

    const announcement = await Announcement.findById(announcementId).populate("authorId", "name email");
    if (!announcement) throw new HttpError(404, "Announcement not found");

    const filter = {};
    if (targetRole) filter.role = targetRole;
    if (targetDepartment) filter.department = targetDepartment;

    const users = await User.find(filter).select("email name");
    const { html, text } = renderAnnouncementEmail(announcement);

    const results = [];
    for (const user of users) {
        try {
            await sendMail({
                to: user.email,
                subject: `EduSync: ${announcement.title}`,
                html,
                text,
            });
            results.push({ email: user.email, status: "sent" });
        } catch (e) {
            results.push({ email: user.email, status: "failed", error: e.message });
        }
    }

    return res.json({ ok: true, sent: results.filter((r) => r.status === "sent").length, results });
}

export async function testEmail(req, res) {
    const { to } = req.body;

    if (!to) throw new HttpError(400, "to is required");

    await sendMail({
        to,
        subject: "EduSync Test Email",
        html: "<p>This is a test email from EduSync ERP.</p>",
        text: "This is a test email from EduSync ERP.",
    });

    return res.json({ ok: true });
}
