// ============================================================
// models/AuditLog.js
// Req 11: Track every important admin / warden action
// ============================================================
const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorRole: {
      type: String,
      enum: ["admin", "warden", "student"],
      required: true,
    },
    action: {
      // e.g.  STUDENT_REGISTERED | LEAVE_APPROVED | LEAVE_REJECTED |
      //       COMPLAINT_RESOLVED | ROOM_ALLOCATED | PAYMENT_VERIFIED
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    targetModel: {
      // Which collection was affected
      type: String,   // "Student" | "LeaveRequest" | "Room" | "Payment" …
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    description: {
      // Human-readable summary, e.g. "Warden approved leave for John Doe"
      type: String,
      required: true,
    },
    meta: {
      // Any extra data worth storing (diff, reason, etc.)
      type: mongoose.Schema.Types.Mixed,
    },
    ip: String,   // Request IP for security auditing
  },
  { timestamps: true }
);

// Indexes for fast admin queries
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ targetId: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
