const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  getMyProfile,
  getRoomStatus,
  getAllStudents,
  getStudentByRoll,   // ✅ NEW
} = require("../controllers/studentController");


// 🔵 STUDENT ROUTES
router.get("/profile", protect, authorize("student"), getMyProfile);
router.get("/room-status", protect, authorize("student"), getRoomStatus);


// 🟢 WARDEN ROUTES
router.get("/", protect, authorize("warden"), getAllStudents);

// ✅ IMPORTANT — ADD THIS ROUTE
router.get("/by-roll/:rollNumber", protect, authorize("warden"), getStudentByRoll);

module.exports = router;