import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendVerificationEmail(email, token) {
  // important: local testing should work even without SMTP.
  // note: if SMTP is empty, we print the verification link in terminal.
  // nota bene: configure Gmail App Password later for real emails.

  const verifyUrl = `http://localhost:${process.env.PORT}/api/auth/verify-email?token=${token}`;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.MAIL_FROM) {
    console.log("Email skipped. Verification link:");
    console.log(verifyUrl);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Verify your account",
    html: `
      <p>Hello,</p>
      <p>Please verify your account:</p>
      <p><a href="${verifyUrl}">Verify account</a></p>
    `
  });
}