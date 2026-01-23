import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.MAIL_FROM;

    if (!host || !user || !pass || !from) {
        throw new Error("SMTP configuration missing (SMTP_HOST, SMTP_USER, SMTP_PASS, MAIL_FROM)");
    }

    transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });

    return transporter;
}

export async function sendMail({ to, subject, html, text }) {
    const transporter = getTransporter();
    const from = process.env.MAIL_FROM;

    const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
    });

    return info;
}

export function renderAnnouncementEmail(announcement) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${announcement.title}</h2>
      <p style="color: #555; white-space: pre-wrap;">${announcement.body}</p>
      ${announcement.attachments?.length
        ? `<p><strong>Attachments:</strong></p><ul>${announcement.attachments.map(a => `<li><a href="${a}">${a}</a></li>`).join("")}</ul>`
        : ""
      }
      <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999;">Sent from EduSync ERP</p>
    </div>`;
    const text = `${announcement.title}\n\n${announcement.body}\n\n${announcement.attachments?.length ? "Attachments:\n" + announcement.attachments.join("\n") : ""}`;
    return { html, text };
}

export function renderWelcomeEmail(user) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to EduSync</h2>
      <p>Hi ${user.name},</p>
      <p>Your account has been created successfully.</p>
      <p>Role: <strong>${user.role}</strong></p>
      ${user.department ? `<p>Department: ${user.department}</p>` : ""}
      <p>You can now <a href="${process.env.FRONTEND_ORIGIN || "http://localhost:8080"}">sign in</a>.</p>
      <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999;">EduSync ERP</p>
    </div>`;
    const text = `Welcome to EduSync\n\nHi ${user.name},\n\nYour account has been created successfully.\n\nRole: ${user.role}\n${user.department ? `Department: ${user.department}\n` : ""}Sign in at ${process.env.FRONTEND_ORIGIN || "http://localhost:8080"}`;
    return { html, text };
}
