import express from "express";
import cookieSession from "cookie-session";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { pool } from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());
app.set("trust proxy", 1);

app.use(cookieSession({
  name: "sid",
  keys: [process.env.SESSION_SECRET || "local_dev_secret"],
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 24 * 60 * 60 * 1000
}));
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running." });
});
app.get("/api/health/db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({
      message: "Database connected",
      ok: rows[0].ok
    });
  } catch (error) {
    console.error("DB HEALTH ERROR:", error);
    res.status(500).json({
      message: "Database connection failed",
      code: error.code,
      error: error.message
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ message: "Server is running." });
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
const railwayPort = process.env.PORT || 8079;

if (!process.env.VERCEL) {
  app.listen(railwayPort, "0.0.0.0", () => {
    console.log(`Server running on port ${railwayPort}`);
  });
}

export { app };

