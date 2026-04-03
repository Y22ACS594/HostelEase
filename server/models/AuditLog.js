// server/models/AuditLog.js
// ✅ FIXED: added "gatekeeper" to actorRole enum

const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    actorRole: {
      type: String,
      // ✅ "gatekeeper" added here
      enum: ["student", "warden", "admin", "gatekeeper", "system"],
      required: false,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    targetModel: {
      type: String,
      trim: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    description: {
      type: String,
      trim: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ip: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries by actor and action
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);