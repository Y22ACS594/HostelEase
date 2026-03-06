const mongoose = require("mongoose");

const roomAllocationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    bedNumber: { type: String, required: true },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkInDate: {
    type: Date,
    default: Date.now
  },

  checkOutDate: {
    type: Date,
    default: null
  },

  status: {
    type: String,
    enum: ["active", "checkedOut"],
    default: "active"
  }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RoomAllocation", roomAllocationSchema);
