import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendAlertEmail = async ({ url, status, recipient }) => {
    const subject =
        status === "DOWN"
            ? `🚨 ALERT: ${url} is DOWN`
            : `✅ RECOVERED: ${url} is UP`;

    const html = `
    <h2>Monitor Alert</h2>
    <p><strong>URL:</strong> ${url}</p>
    <p><strong>Status:</strong> ${status}</p>
    <p>Time: ${new Date().toISOString()}</p>
  `;

    const info = await transporter.sendMail({
        from: `"Uptime Monitor" <${process.env.EMAIL_USER}>`,
        to: recipient ?? process.env.ALERT_EMAIL,
        subject,
        html
    });

    return info;
};