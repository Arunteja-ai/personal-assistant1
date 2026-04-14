import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fs from "fs";
import helmet from "helmet";
import path from "path";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { adminOnly, protect } from "./middleware/authMiddleware.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import dailyLogRoutes from "./routes/dailyLogRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
app.set("trust proxy", 1);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");

const isAllowedOrigin = (origin) =>
  env.clientUrls.includes(origin) ||
  env.clientUrlPatterns.some((pattern) => pattern.test(origin));

const apiCors = cors((req, callback) => {
  const origin = req.header("Origin");
  const requestOrigin = `${req.protocol}://${req.get("host")}`;
  const allowed =
    !origin || isAllowedOrigin(origin) || origin === requestOrigin;

  callback(
    allowed ? null : new Error("CORS origin is not allowed."),
    {
      origin: allowed,
      credentials: true,
    },
  );
});

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 250,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

app.options("/api/*", apiCors);
app.use("/api", apiCors);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", protect, dashboardRoutes);
app.use("/api/profile", protect, profileRoutes);
app.use("/api/goals", protect, goalRoutes);
app.use("/api/todos", protect, todoRoutes);
app.use("/api/transactions", protect, transactionRoutes);
app.use("/api/notes", protect, noteRoutes);
app.use("/api/habits", protect, habitRoutes);
app.use("/api/daily-logs", protect, dailyLogRoutes);
app.use("/api/admin", protect, adminOnly, adminRoutes);

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }

    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res.json({
      service: "ai-personal-assistant-api",
      status: "ok",
      health: "/api/health",
    });
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
