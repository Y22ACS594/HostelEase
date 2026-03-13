// routes/notificationRoutes.js
const router  = require("express").Router();
const protect = require("../middleware/authMiddleware");
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  deleteOne,
  clearAll,
} = require("../controllers/notificationController");

router.get   ("/",             protect, getMyNotifications);
router.get   ("/unread-count", protect, getUnreadCount);
router.patch ("/:id/read",     protect, markAsRead);
router.patch ("/read-all",     protect, markAllRead);
router.delete("/clear-all",    protect, clearAll);
router.delete("/:id",          protect, deleteOne);

module.exports = router;