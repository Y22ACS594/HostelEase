// routes/analyticsRoutes.js
const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
  getOverview,
  getLeaveTrends,
  getRoomOccupancy,
} = require("../controllers/analyticsController");

router.get("/overview",       protect, authorize("warden", "admin"), getOverview);
router.get("/leave-trends",   protect, authorize("warden", "admin"), getLeaveTrends);
router.get("/room-occupancy", protect, authorize("warden", "admin"), getRoomOccupancy);

module.exports = router;
