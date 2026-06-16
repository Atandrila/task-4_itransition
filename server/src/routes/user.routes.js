import express from "express";
import { pool } from "../db.js";
import { requireValidUser } from "../middleware/authGuard.js";

const router = express.Router();

router.use(requireValidUser);

function buildInClause(ids) {
  // important: use SQL placeholders instead of direct user input.
  // note: this prevents SQL injection.
  // nota bene: reject empty arrays before calling this function.
  return ids.map(() => "?").join(",");
}

router.get("/", async (req, res) => {
  const [rows] = await pool.execute(
    `
    SELECT
      public_id AS id,
      name,
      email,
      status,
      last_login_at,
      last_activity_at,
      created_at
    FROM users
    ORDER BY COALESCE(last_login_at, created_at) DESC
    `
  );

  res.json({ users: rows });
});

router.patch("/block", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Select at least one user." });
  }

  const placeholders = buildInClause(ids);

  await pool.execute(
    `UPDATE users SET status = 'blocked' WHERE public_id IN (${placeholders})`,
    ids
  );

  res.json({ message: "Selected users blocked successfully." });
});

router.patch("/unblock", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Select at least one user." });
  }

  const placeholders = buildInClause(ids);

  await pool.execute(
    `UPDATE users SET status = 'active' WHERE public_id IN (${placeholders})`,
    ids
  );

  res.json({ message: "Selected users unblocked successfully." });
});

router.delete("/", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Select at least one user." });
  }

  const placeholders = buildInClause(ids);

  await pool.execute(
    `DELETE FROM users WHERE public_id IN (${placeholders})`,
    ids
  );

  res.json({ message: "Selected users deleted successfully." });
});

router.delete("/unverified", async (req, res) => {
  await pool.execute("DELETE FROM users WHERE status = 'unverified'");

  res.json({ message: "All unverified users deleted successfully." });
});

export default router;