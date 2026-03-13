// models/Notification.js — Complete SaaS notification model
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
        "LEAVE_APPROVED",     // → student
        "LEAVE_REJECTED",     // → student
        "ROOM_ALLOCATED",     // → student
        "ROOM_DEALLOCATED",   // → student
        "PAYMENT_CONFIRMED",  // → student
        "STUDENT_REGISTERED", // → student (welcome)
        "LEAVE_APPLIED",      // → warden
        "PAYMENT_RECEIVED",   // → warden
        "COMPLAINT_RESOLVED",
        "GENERAL",
      ],
      required: true,
    },
    title:        { type: String, required: true },
    message:      { type: String, required: true },
    isRead:       { type: Boolean, default: false, index: true },
    relatedModel: { type: String },
    relatedId:    { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model("Notification", notificationSchema);