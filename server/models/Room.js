const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    blockName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    totalBeds: { type: Number, required: true },
    occupiedBeds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
