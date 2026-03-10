// server/models/LeaveRequest.js
//
// ✅ FIX 1: Added "Casual" to leaveType enum.
//    ApplyLeave.jsx sends leaveType:"Casual" but the old model only had
//    ["Home","Medical","Emergency","Event","Other"] → Mongoose threw a
//    ValidationError → 500 on every leave submission.
//
// ✅ FIX 2: Added totalDays field so frontend value is persisted.

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
      // ✅ "Casual" added — matches what ApplyLeave.jsx sends
      enum: ["Casual", "Home", "Medical", "Emergency", "Event", "Other"],
    },
    reason:           { type: String, required: true, minlength: 10 },
    fromDate:         { type: Date,   required: true },
    toDate:           { type: Date,   required: true },
    // ✅ totalDays persisted from frontend calculation
    totalDays:        { type: Number },
    destination:      { type: String, required: true },
    emergencyContact: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    remarks: String,
    // Mandatory when status = Rejected (enforced in controller too)
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);