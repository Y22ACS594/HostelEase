// routes/studentRoutes.js
const express = require("express");
const router  = express.Router();

const protect   = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  getMyProfile,
  getRoomStatus,
  getRoommates,
  getAllStudents,
  getStudentByRoll,
} = require("../controllers/studentController");

// STUDENT ROUTES
router.get("/profile",              protect, authorize("student"), getMyProfile);
router.get("/room-status",          protect, authorize("student"), getRoomStatus);
router.get("/roommates",            protect, authorize("student"), getRoommates);

// WARDEN ROUTES
router.get("/",                     protect, authorize("warden"),  getAllStudents);
router.get("/by-roll/:rollNumber",  protect, authorize("warden"),  getStudentByRoll);

module.exports = router;