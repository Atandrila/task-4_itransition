import express from "express";
import session from "express-session";
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

app.use(session({
  name: "sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false
  }
}));

app.get("/api/debug/db", async (req, res) => {
  try {
    const [dbRows] = await pool.execute("SELECT DATABASE() AS db_name");
    const [tableRows] = await pool.execute("SHOW TABLES");
    const [indexRows] = await pool.execute("SHOW INDEX FROM users");

    res.json({
      message: "Database connected.",
      database: dbRows,
      tables: tableRows,
      indexes: indexRows.map(row => row.Key_name)
    });
  } catch (error) {
    console.error("DB DEBUG ERROR:", error);

    res.status(500).json({
      message: "Database connection failed.",
      detail: error.message,
      code: error.code
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
