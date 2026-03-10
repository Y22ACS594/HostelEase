// routes/leaveRoutes.js
const router = require("express").Router();
const protect   = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  getLeaveStats,
} = require("../controllers/leaveController");

// Student
router.post("/apply",     protect, authorize("student"),         applyLeave);
router.get("/my-leaves",  protect, authorize("student"),         getMyLeaves);

// Warden / Admin
router.get("/",           protect, authorize("warden", "admin"), getAllLeaves);
router.put("/:id",        protect, authorize("warden", "admin"), updateLeaveStatus);
router.get("/stats",      protect, authorize("warden", "admin"), getLeaveStats);

module.exports = router;
