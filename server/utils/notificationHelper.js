// ============================================================
// utils/notificationHelper.js
// Req 9: Create in-app notifications
// ============================================================
const Notification = require("../models/Notification");

/**
 * Push a notification to a user
 * @param {string} recipientUserId - User._id
 * @param {"LEAVE_APPROVED"|"LEAVE_REJECTED"|"COMPLAINT_RESOLVED"|"PAYMENT_CONFIRMED"|"ROOM_ALLOCATED"|"GENERAL"} type
 * @param {string} title
 * @param {string} message
 * @param {Object} [related] - { model, id }
 */
const pushNotification = async (
  recipientUserId,
  type,
  title,
  message,
  related = {}
) => {
  try {
    await Notification.create({
      recipient: recipientUserId,
      type,
      title,
      message,
      relatedModel: related.model,
      relatedId: related.id,
    });
  } catch (err) {
    console.error("Notification push failed:", err.message);
  }
};

module.exports = pushNotification;
