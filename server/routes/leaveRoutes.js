const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  applyLeave,
  getMyLeaves,
} = require("../controllers/leaveController");

// 👨‍🎓 Student routes
router.post("/apply", protect, authorize("student"), applyLeave);
router.get("/my", protect, authorize("student"), getMyLeaves);

module.exports = router;
