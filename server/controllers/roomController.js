const RoomAllocation = require("../models/RoomAllocation");
const Student = require("../models/Student");

// Allocate room to student
exports.allocateRoom = async (req, res) => {
  try {
    const { studentId, roomNumber, bedNumber } = req.body;

    // Check student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Prevent double allocation
    const alreadyAllocated = await RoomAllocation.findOne({
      $or: [
        { student: studentId },
        { roomNumber, bedNumber },
      ],
    });

    if (alreadyAllocated) {
      return res
        .status(400)
        .json({ message: "Room or bed already allocated" });
    }

    const allocation = await RoomAllocation.create({
      student: studentId,
      roomNumber,
      bedNumber,
      allocatedBy: req.user.id,
    });

    // Update student record
    student.roomNumber = roomNumber;
    student.bedNumber = bedNumber;
    await student.save();

    res.status(201).json(allocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View all allocations
exports.getAllAllocations = async (req, res) => {
  try {
    const allocations = await RoomAllocation.find()
      .populate("student")
      .populate("allocatedBy", "name email");

    res.json(allocations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
