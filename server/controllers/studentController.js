const Student = require("../models/Student");
const RoomAllocation = require("../models/RoomAllocation");


// ===============================
// STUDENT → PROFILE
// ===============================
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


// ===============================
// STUDENT → ROOM STATUS
// ===============================
exports.getRoomStatus = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

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
      roomNumber: allocation.room.roomNumber,
      bedNumber: allocation.bedNumber,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================
// WARDEN → GET ALL STUDENTS
// ===============================
exports.getAllStudents = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const { batch, department } = req.query;

    let filter = {};

    if (batch) filter.batch = batch;
    if (department) filter.department = department;

    const totalStudents = await Student.countDocuments(filter);

    const students = await Student.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      students,
      totalStudents,
      currentPage: page,
      totalPages: Math.ceil(totalStudents / limit),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =================================
// WARDEN → GET STUDENT BY ROLL NUMBER
// =================================
exports.getStudentByRoll = async (req, res) => {
  try {

    const student = await Student.findOne({
      rollNumber: req.params.rollNumber
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      fullName: student.fullName,
      studentId: student._id
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};