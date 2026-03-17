// models/Issue.js
const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    category: {
      type: String,
      enum: ["Maintenance", "Cleanliness", "Electrical", "Plumbing", "Security", "Food", "Internet", "Noise", "Other"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
      index: true,
    },
    // Warden's response when resolving
    resolution: {
      type: String,
      default: "",
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: Date,

    // Photo attachments (base64 or URLs)
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

issueSchema.index({ student: 1, createdAt: -1 });
issueSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model("Issue", issueSchema);