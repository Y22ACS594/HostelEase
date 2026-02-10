const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  getMyProfile,
  getRoomStatus,
} = require("../controllers/studentController");

router.get("/profile", protect, authorize("student"), getMyProfile);
router.get("/room-status", protect, authorize("student"), getRoomStatus);

module.exports = router;
