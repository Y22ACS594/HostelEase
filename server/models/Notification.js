// ============================================================
// models/Notification.js
// Req 9: In-app notifications for students
// ============================================================
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "LEAVE_APPROVED",
        "LEAVE_REJECTED",
        "COMPLAINT_RESOLVED",
        "PAYMENT_CONFIRMED",
        "ROOM_ALLOCATED",
        "GENERAL",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
    // Link to the related document (optional)
    relatedModel: String,
    relatedId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

// Auto-delete notifications older than 90 days
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

module.exports = mongoose.model("Notification", notificationSchema);
