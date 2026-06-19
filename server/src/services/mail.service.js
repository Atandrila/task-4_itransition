import dotenv from "dotenv";

dotenv.config();

async function sendGoogleScriptEmail({ to, subject, text, html }) {
  // important: Railway free/trial blocks SMTP, so we use Google Apps Script HTTPS.
  // note: MAIL_API_SECRET must match the secret inside Apps Script.
  // nota bene: this still sends real email without Brevo or SMTP.

  if (!process.env.GOOGLE_SCRIPT_MAIL_URL || !process.env.MAIL_API_SECRET) {
    console.log("Email skipped. Missing GOOGLE_SCRIPT_MAIL_URL or MAIL_API_SECRET.");
    console.log(text);
    return;
  }

  const response = await fetch(process.env.GOOGLE_SCRIPT_MAIL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      secret: process.env.MAIL_API_SECRET,
      to,
      subject,
      text,
      html,
      fromName: process.env.MAIL_FROM_NAME || "User Management App"
    })
  });

  const raw = await response.text();

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = { ok: false, error: raw };
  }

  if (!response.ok || data.ok === false) {
    throw new Error(`Google Apps Script email failed: ${JSON.stringify(data)}`);
  }

  return data;
}

export async function sendVerificationEmail(email, token) {
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  const verifyUrl = `${backendUrl}/api/auth/verify-email?token=${token}`;

  await sendGoogleScriptEmail({
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
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  await sendGoogleScriptEmail({
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