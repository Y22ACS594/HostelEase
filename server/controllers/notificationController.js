// ============================================================
// controllers/notificationController.js
// Req 9: Student notification endpoints
// ============================================================
const Notification = require("../models/Notification");


/* GET /api/notifications  — student's own notifications */
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification
      .find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({ notifications, unreadCount });
  } catch (err) { next(err); }
};


/* PATCH /api/notifications/:id/read */
exports.markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    res.json(notif);
  } catch (err) { next(err); }
};


/* PATCH /api/notifications/read-all */
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) { next(err); }
};
