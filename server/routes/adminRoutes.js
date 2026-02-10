const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createWarden,
  getAllWardens,
  toggleWardenStatus,
} = require("../controllers/adminController");

// ADMIN routes
router.post("/warden", protect, authorize("admin"), createWarden);
router.get("/wardens", protect, authorize("admin"), getAllWardens);
router.put("/warden/:id/toggle", protect, authorize("admin"), toggleWardenStatus);

module.exports = router;
