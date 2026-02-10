const Student = require("../models/Student");
const RoomAllocation = require("../models/RoomAllocation");

// ✅ Student → Profile
exports.getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Student → Room Status (FIXED)
exports.getRoomStatus = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🔥 populate room
    const allocation = await RoomAllocation
      .findOne({ student: student._id })
      .populate("room");

    if (!allocation || !allocation.room) {
      return res.json({
        roomNumber: null,
        bedNumber: null,
      });
    }

    res.json({
      roomNumber: allocation.room.roomNumber, // ✅ CORRECT
      bedNumber: allocation.bedNumber,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
