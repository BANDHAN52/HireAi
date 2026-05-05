// ─────────────────────────────────────────────
// utils/email.utils.js
// NodeMailer দিয়ে email পাঠানো
// Gmail SMTP use করবো (free)
// ─────────────────────────────────────────────

import nodemailer from "nodemailer";

// ── Transporter — Gmail SMTP configure করো ──
// একবার তৈরি হবে, বারবার reuse করবো
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,  // তোমার Gmail address
    pass: process.env.EMAIL_PASS,  // Gmail App Password (regular password না)
    // App Password পেতে: Google Account → Security → 2-Step Verification → App passwords
  },
});

// ─────────────────────────────────────────────
// sendEmail — email পাঠানোর main function
// Usage: await sendEmail({ to, subject, html })
// ─────────────────────────────────────────────
export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"HireAI" <${process.env.EMAIL_USER}>`,  // Sender name + email
    to,        // Recipient email
    subject,   // Email subject
    html,      // HTML content (rich email)
  };

  await transporter.sendMail(mailOptions);
  console.log(`✉️  Email sent to: ${to}`);
};
