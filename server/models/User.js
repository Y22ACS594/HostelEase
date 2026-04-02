// server/models/User.js
// ✅ Added "gatekeeper" to role enum

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "warden", "student", "gatekeeper"],
      default: "student",
    },

    // ── Password Reset ──────────────────────────────────────────────
    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date   },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);