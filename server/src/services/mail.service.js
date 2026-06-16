import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendVerificationEmail(email, token) {

  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

  const verifyUrl = `${backendUrl}/api/auth/verify-email?token=${token}`;

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
      pass: process.env.SMTP_PASS.replace(/\s/g, "")
    }
  });

  await transporter.sendMail({
    from: `"User Management App" <${process.env.MAIL_FROM}>`,
    to: email,
    subject: "Verify your account",
    text: `Please verify your account by opening this link: ${verifyUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verify your account</h2>

        <p>Hello,</p>

        <p>Please click the button below to verify your account:</p>

        <p>
          <a 
            href="${verifyUrl}" 
            style="
              display: inline-block;
              padding: 10px 16px;
              background: #0d6efd;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Verify account
          </a>
        </p>

        <p>If the button does not work, copy and paste this link into your browser:</p>

        <p>
          <a href="${verifyUrl}">${verifyUrl}</a>
        </p>
      </div>
    `
  });

  console.log("Verification email sent successfully to:", email);
  console.log("Verification link:", verifyUrl);
}
