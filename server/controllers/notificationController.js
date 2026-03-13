// controllers/notificationController.js — Full SaaS notification CRUD
const Notification = require("../models/Notification");

/* GET /api/notifications?limit=50&skip=0  — any role */
exports.getMyNotifications = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const skip  = Number(req.query.skip) || 0;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipient: req.user.id }),
      Notification.countDocuments({ recipient: req.user.id, isRead: false }),
    ]);

    res.json({ notifications, total, unreadCount });
  } catch (err) { next(err); }
};

/* GET /api/notifications/unread-count  — lightweight poll */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });
    res.json({ unreadCount: count });
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

/* DELETE /api/notifications/:id */
exports.deleteOne = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id,
    });
    res.json({ message: "Notification deleted" });
  } catch (err) { next(err); }
};

/* DELETE /api/notifications/clear-all */
exports.clearAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ message: "All notifications cleared" });
  } catch (err) { next(err); }
};