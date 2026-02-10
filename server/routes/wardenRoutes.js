const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  allocateRoom,
  addStudent,
} = require("../controllers/wardenController");

const {
  getAllLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveController");

// ======================
// STUDENT MANAGEMENT
// ======================

// Add Student
router.post(
  "/students",
  protect,
  authorize("warden"),
  addStudent
);

// Allocate Room
router.post(
  "/allocate-room",
  protect,
  authorize("warden"),
  allocateRoom
);

// ======================
// LEAVE MANAGEMENT (WARDEN)
// ======================

// View all leave requests
router.get(
  "/leaves",
  protect,
  authorize("warden"),
  getAllLeaves
);

// Approve / Reject leave
router.put(
  "/leaves/:id",
  protect,
  authorize("warden"),
  updateLeaveStatus
);

module.exports = router;
