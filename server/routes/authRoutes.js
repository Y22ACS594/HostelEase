const express = require("express");
const router = express.Router();

const {
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.post("/login", login);

// 🔐 Forgot password routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
