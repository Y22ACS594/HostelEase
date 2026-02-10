const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  getMyPayments,
  initiatePayment,
  confirmPayment,
  getAllPayments,
} = require("../controllers/paymentController");

// Student routes
router.get("/my", protect, authorize("student"), getMyPayments);
router.post("/initiate", protect, authorize("student"), initiatePayment);
router.post("/confirm/:id", protect, authorize("student"), confirmPayment);

// Warden / Admin routes
router.get("/all", protect, authorize("warden", "admin"), getAllPayments);

module.exports = router;
