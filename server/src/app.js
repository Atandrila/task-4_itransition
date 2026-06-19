import express from "express";
import cookieSession from "cookie-session";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

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

app.get("/health", (req, res) => {
  res.json({ message: "Server is running." });
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
}
export { app };
