// routes/notificationRoutes.js
const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const {
  getMyNotifications,
  markAsRead,
  markAllRead,
} = require("../controllers/notificationController");

router.get("/",            protect, getMyNotifications);
router.patch("/:id/read",  protect, markAsRead);
router.patch("/read-all",  protect, markAllRead);

module.exports = router;
