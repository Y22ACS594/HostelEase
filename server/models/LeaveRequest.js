// server/models/LeaveRequest.js
// ✅ Added exitedAt + exitMarkedBy for gatekeeper exit tracking

const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      required: true,
      enum: ["Casual", "Home", "Medical", "Emergency", "Event", "Other"],
    },
    reason:           { type: String, required: true, minlength: 10 },
    fromDate:         { type: Date,   required: true },
    toDate:           { type: Date,   required: true },
    totalDays:        { type: Number },
    destination:      { type: String, required: true },
    emergencyContact: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    remarks:         String,
    rejectionReason: {
      type: String,
      validate: {
        validator(v) {
          if (this.status === "Rejected") return v && v.trim().length >= 5;
          return true;
        },
        message: "Rejection reason is required (min 5 chars) when status is Rejected",
      },
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ── GATEKEEPER EXIT TRACKING ────────────────────────────────────
    exitedAt: {
      type: Date,
      default: null,
    },
    exitMarkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // "Exited" means exitedAt is set; "Denied" means gatekeeper blocked
    gateStatus: {
      type: String,
      enum: ["Pending", "Exited", "Denied", null],
      default: null,
    },
    gateDeniedReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);