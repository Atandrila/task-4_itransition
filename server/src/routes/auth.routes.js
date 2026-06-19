import express from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js"
import { requireValidUser } from "../middleware/authGuard.js";
import { getUniqIdValue, getEmailToken, getPasswordResetToken } from "../utils/getUniqIdValue.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/mail.service.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const publicId = getUniqIdValue();
    const token = getEmailToken();

    try {
      await pool.execute(
        `
        INSERT INTO users
        (public_id, name, email, password_hash, status, email_verification_token)
        VALUES (?, ?, ?, ?, 'unverified', ?)
        `,
        [publicId, name.trim(), email.trim(), passwordHash, token]
      );
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "This email is already registered."
        });
      }

      throw error;
    }

    setImmediate(() => {
      sendVerificationEmail(email.trim(), token).catch(console.error);
    });

    res.status(201).json({
      message: "Registration successful. Please check your email for verification."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email_key = LOWER(TRIM(?))",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = rows[0];

    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Your account is blocked."
      });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    await pool.execute(
      "UPDATE users SET last_login_at = NOW(), last_activity_at = NOW() WHERE id = ?",
      [user.id]
    );

    req.session.userId = user.id;

    res.json({
      message: "Login successful.",
      user: {
        id: user.public_id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed." });
  }
});

router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    }

    await pool.execute(
      `
      UPDATE users
      SET
        status = CASE
          WHEN status = 'blocked' THEN 'blocked'
          ELSE 'active'
        END,
        email_verified_at = CASE
          WHEN status = 'blocked' THEN email_verified_at
          ELSE NOW()
        END,
        email_verification_token = NULL
      WHERE email_verification_token = ?
      `,
      [token]
    );

    res.redirect(`${process.env.CLIENT_URL}/login`);
  } catch (error) {
    console.error(error);
    res.redirect(`${process.env.CLIENT_URL}/login`);
  }
});

router.get("/me", requireValidUser, async (req, res) => {
  res.json({ user: req.currentUser });
});

router.post("/logout", requireValidUser, async (req, res) => {
  req.session = null;
  res.json({ message: "Logged out." });
});
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        message: "Email is required."
      });
    }

    const [rows] = await pool.execute(
      "SELECT id, email, status FROM users WHERE email_key = LOWER(TRIM(?))",
      [email]
    );

    // important: do not reveal whether the email exists.
    // note: this prevents account enumeration.
    // nota bene: user still receives a friendly status message.
    if (rows.length === 0 || rows[0].status === "blocked") {
      return res.json({
        message: "If this email exists, a reset link has been sent."
      });
    }

    const token = getPasswordResetToken();

    await pool.execute(
      `
      UPDATE users
      SET reset_password_token = ?,
          reset_password_expires_at = DATE_ADD(NOW(), INTERVAL 1 HOUR)
      WHERE id = ?
      `,
      [token, rows[0].id]
    );

    setImmediate(() => {
      sendPasswordResetEmail(rows[0].email, token).catch(console.error);
    });

    res.json({
      message: "If this email exists, a reset link has been sent."
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Could not send reset link." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Reset token and new password are required."
      });
    }

    const [rows] = await pool.execute(
      `
      SELECT id, status
      FROM users
      WHERE reset_password_token = ?
        AND reset_password_expires_at > NOW()
      `,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        message: "Reset link is invalid or expired."
      });
    }

    if (rows[0].status === "blocked") {
      return res.status(403).json({
        message: "This account is blocked."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.execute(
      `
      UPDATE users
      SET password_hash = ?,
          reset_password_token = NULL,
          reset_password_expires_at = NULL
      WHERE id = ?
      `,
      [passwordHash, rows[0].id]
    );

    res.json({
      message: "Password reset successful. You can now sign in."
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Password reset failed." });
  }
});
export default router;
