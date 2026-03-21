// routes/adminRoutes.js
const express   = require("express");
const router    = express.Router();
const protect   = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
  createWarden, getAllWardens, getWarden,
  updateWarden, toggleWardenStatus, deleteWarden,
} = require("../controllers/adminController");

const admin = [protect, authorize("admin")];

router.post  ("/warden",          ...admin, createWarden);
router.get   ("/wardens",         ...admin, getAllWardens);
router.get   ("/warden/:id",      ...admin, getWarden);
router.put   ("/warden/:id",      ...admin, updateWarden);
router.delete("/warden/:id",      ...admin, deleteWarden);
router.put   ("/warden/:id/toggle",...admin, toggleWardenStatus);

module.exports = router;