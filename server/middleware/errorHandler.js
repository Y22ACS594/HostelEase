// ============================================================
// middleware/errorHandler.js
// Req 12: Centralised error handling — no more try/catch noise
// ============================================================

const errorHandler = (err, req, res, next) => {
  // Log the full error internally but never leak stack traces to clients
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);

  // Mongoose duplicate-key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      message: `Duplicate value for ${field}. Please use a different value.`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token. Please login again." });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired. Please login again." });
  }

  // CORS error (thrown by our cors config)
  if (err.message && err.message.startsWith("CORS policy")) {
    return res.status(403).json({ message: err.message });
  }

  // Default 500
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal server error",
    // Only include stack in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
