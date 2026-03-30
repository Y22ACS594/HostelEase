// routes/notificationRoutes.js
const router  = require("express").Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  deleteOne,
  clearAll,
  broadcastToWardens,
} = require("../controllers/notificationController");

router.get   ("/",             protect, getMyNotifications);
router.get   ("/unread-count", protect, getUnreadCount);
router.patch ("/read-all",     protect, markAllRead);           // must be before /:id
router.patch ("/:id/read",     protect, markAsRead);
router.delete("/clear-all",    protect, clearAll);              // must be before /:id
router.delete("/:id",          protect, deleteOne);

// Admin-only: broadcast to all wardens
router.post  ("/broadcast",    protect, authorize("admin"), broadcastToWardens);

module.exports = router;