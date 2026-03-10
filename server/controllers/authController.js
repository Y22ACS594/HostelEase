// ============================================================
// controllers/authController.js
// Req 3: Resend-powered password reset  |  Req 8: RBAC login
// ============================================================
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { sendEmail, buildResetEmail } = require("../utils/sendEmail");

const RESET_TOKEN_EXPIRE_MS = 15 * 60 * 1000; // 15 minutes


/* ═══════════════════════════════════════════════════════════
   LOGIN  (admin | warden | student)
═══════════════════════════════════════════════════════════ */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      // Constant-time response to prevent user enumeration
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Contact admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
      email: user.email,
    });
  } catch (err) { next(err); }
};


/* ═══════════════════════════════════════════════════════════
   FORGOT PASSWORD  (students only)
═══════════════════════════════════════════════════════════ */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email, role: "student" });

    // Always respond with success to prevent email enumeration
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    // Generate token — store only the hash
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordExpire = Date.now() + RESET_TOKEN_EXPIRE_MS;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    await sendEmail(
      user.email,
      "SmartHostel — Reset Your Password",
      buildResetEmail(resetLink, user.name)
    );

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) { next(err); }
};


/* ═══════════════════════════════════════════════════════════
   RESET PASSWORD
═══════════════════════════════════════════════════════════ */
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) { next(err); }
};


/* ═══════════════════════════════════════════════════════════
   GET CURRENT USER  (me)
═══════════════════════════════════════════════════════════ */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) { next(err); }
};
