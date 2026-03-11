// ============================================================
// server.js  ─  SmartHostel Production Entry Point
// Req 12: CORS, error handling, scalable structure
// ============================================================
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const errorHandler = require("./middleware/errorHandler");

// ← ADD THESE TWO LINES
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);


const app = express();

// ─────────────────────────────────────────
// SECURITY MIDDLEWARE
// ─────────────────────────────────────────
app.use(helmet());                         // Sets secure HTTP headers
app.use(mongoSanitize());                 // Prevents NoSQL injection

// CORS — allow only your Vercel frontend (+ localhost for dev)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
   "https://hostelease.online",
  "https://www.hostelease.online"

].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server (no origin) or whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Global rate limiter  — 100 req / 15 min per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many auth attempts. Please wait 15 minutes." },
});

app.use(express.json({ limit: "10kb" }));  // Prevents large payload attacks
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────
app.use("/api/auth",        authLimiter, require("./routes/authRoutes"));
app.use("/api/students",    require("./routes/studentRoutes"));
app.use("/api/warden",      require("./routes/wardenRoutes"));
app.use("/api/admin",       require("./routes/adminRoutes"));
app.use("/api/leave",       require("./routes/leaveRoutes"));
app.use("/api/payments",    require("./routes/paymentRoutes"));
app.use("/api/rooms",       require("./routes/roomRoutes"));
app.use("/api/analytics",   require("./routes/analyticsRoutes"));
app.use("/api/notifications",require("./routes/notificationRoutes"));
app.use("/api/audit",       require("./routes/auditRoutes"));

// Health-check (for Render uptime monitoring)
app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

// 404 handler — must be after all routes
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Central error handler — must be last
app.use(errorHandler);

// ─────────────────────────────────────────
// DATABASE + SERVER START
// ─────────────────────────────────────────
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅  MongoDB connected");
  } catch (err) {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);   // Crash fast — let Render restart the service
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`));
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing server…");
  await mongoose.disconnect();
  process.exit(0);
});
