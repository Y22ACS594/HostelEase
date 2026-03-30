// ============================================================
// routes/authRoutes.js
// Forgot Password + Reset Password via Resend
// ============================================================
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/User");
const { sendEmail, buildResetEmail } = require("../utils/sendEmail");


// ─── POST /auth/login ───────────────────────────────
router.post("/login", async (req, res) => { 
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Example role handling (Student / Warden / Admin)
    const role = user.role || "student";

    const jwt = require("jsonwebtoken");

    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role,
      name: user.name,
      email: user.email
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── POST /auth/forgot-password ───────────────────────────────
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // Always return success — don't leak whether email exists
    if (!user) {
      return res.json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    // 1. Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash it before saving to DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // 3. Save token + expiry on user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    // 4. Build reset link with RAW token (not hashed)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    // 5. Send email via Resend
    await sendEmail(
      user.email,
      "Reset Your SmartHostel Password",
      buildResetEmail(resetLink, user.name)
    );

    res.json({ message: "Reset link sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ─── POST /auth/reset-password/:token ─────────────────────────
router.post("/reset-password/:token", async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    // 1. Hash the incoming raw token to compare with DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 2. Find user with matching token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Reset link expired or invalid." });
    }

    // 3. Hash new password and save
    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful!" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

module.exports = router;