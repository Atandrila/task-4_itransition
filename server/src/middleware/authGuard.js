import { pool } from "../db.js";

export async function requireValidUser(req, res, next) {
  try {
    // important: every protected request checks the current user again.
    // note: if the user was blocked or deleted, the next request must fail.
    // nota bene: login, registration, and email verification do not use this guard.

    if (!req.session.userId) {
      return res.status(401).json({
        message: "Please login first.",
        redirectTo: "/login"
      });
    }

    const [rows] = await pool.execute(
      "SELECT id, public_id, name, email, status FROM users WHERE id = ?",
      [req.session.userId]
    );

    if (rows.length === 0 || rows[0].status === "blocked") {
     req.session = null;

      return res.status(401).json({
        message: "Your account was blocked or deleted. Please login again.",
        redirectTo: "/login"
      });
    }

    await pool.execute(
      "UPDATE users SET last_activity_at = NOW() WHERE id = ?",
      [req.session.userId]
    );

    req.currentUser = rows[0];
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Authentication check failed." });
  }
}