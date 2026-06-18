import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS.replace(/\s/g, "")
    }
  });
}

export async function sendVerificationEmail(email, token) {
  // important: show full link and button in email.
  // note: local testing uses localhost, deployment uses BACKEND_URL.
  // nota bene: clicking the link changes unverified user to active.

  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  const verifyUrl = `${backendUrl}/api/auth/verify-email?token=${token}`;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.MAIL_FROM) {
    console.log("Email skipped. Verification link:");
    console.log(verifyUrl);
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"User Management App" <${process.env.MAIL_FROM}>`,
    to: email,
    subject: "Verify your account",
    text: `Please verify your account by opening this link: ${verifyUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verify your account</h2>
        <p>Please click the button below to verify your account:</p>
        <p>
          <a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#0d6efd;color:#fff;text-decoration:none;border-radius:6px;">
            Verify account
          </a>
        </p>
        <p>If the button does not work, copy this link:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      </div>
    `
  });
}

export async function sendPasswordResetEmail(email, token) {
  // important: password reset link goes to frontend page.
  // note: the backend verifies the token before changing password.
  // nota bene: reset token expires after one hour.

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.MAIL_FROM) {
    console.log("Password reset email skipped. Reset link:");
    console.log(resetUrl);
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"User Management App" <${process.env.MAIL_FROM}>`,
    to: email,
    subject: "Reset your password",
    text: `Reset your password by opening this link: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset your password</h2>
        <p>Please click the button below to create a new password:</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#0d6efd;color:#fff;text-decoration:none;border-radius:6px;">
            Reset password
          </a>
        </p>
        <p>This link expires in 1 hour.</p>
        <p>If the button does not work, copy this link:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
      </div>
    `
  });
}
