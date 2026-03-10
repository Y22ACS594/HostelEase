// server/models/RoomAllocation.js
//
// ✅ FIX: Removed `unique: true` from the `student` field.
//    The old model had `student: { unique: true }` which means one student
//    could NEVER be allocated a second time — after checkout, re-allocation
//    threw a MongoDB duplicate key error (11000).
//    Now uniqueness is enforced only for ACTIVE allocations in the controller.

const mongoose = require("mongoose");

const roomAllocationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      // ✅ NOT unique — a student may have multiple historical allocations
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    bedNumber:   { type: String, required: true },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkInDate:  { type: Date, default: Date.now },
    checkOutDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["active", "checkedOut"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Compound index: one ACTIVE allocation per student at a time
roomAllocationSchema.index(
  { student: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

module.exports = mongoose.model("RoomAllocation", roomAllocationSchema);