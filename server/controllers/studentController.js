// controllers/studentController.js
const Student        = require("../models/Student");
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
// FIX: Added status:"active" so checkedOut records are ignored.
// Without this, after deallocation the old checkedOut record was still
// returned, making the student see Room 100 / Bed 3 forever.
exports.getRoomStatus = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const allocation = await RoomAllocation
      .findOne({ student: student._id, status: "active" })   // <-- KEY FIX
      .populate("room");

    if (!allocation || !allocation.room) {
      return res.json({
        roomNumber: null,
        bedNumber:  null,
        block:      null,
        floor:      null,
      });
    }

    res.json({
      roomNumber: allocation.room.roomNumber,
      bedNumber:  allocation.bedNumber,
      block:      allocation.room.blockName ?? null,
      floor:      allocation.room.floor     ?? null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================
// STUDENT → ROOMMATES
// ===============================
// NEW: This function was completely missing from the controller.
// The route was wired in studentRoutes.js but the handler didn't exist,
// so every call to GET /students/roommates returned 404.
exports.getRoommates = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find this student's own active allocation to get their room
    const myAllocation = await RoomAllocation
      .findOne({ student: student._id, status: "active" })
      .populate("room");

    // If not allocated, return empty roommates array
    if (!myAllocation || !myAllocation.room) {
      return res.json({ roommates: [] });
    }

    // Find all OTHER active allocations in the same room
    const others = await RoomAllocation
      .find({
        room:    myAllocation.room._id,
        status:  "active",
        student: { $ne: student._id },    // exclude self
      })
      .populate("student", "fullName rollNumber department course batch avatar");

    const roommates = others.map((a) => ({
      fullName:   a.student?.fullName   ?? "Unknown",
      rollNumber: a.student?.rollNumber ?? "",
      department: a.student?.department ?? "",
      course:     a.student?.course     ?? "",
      batch:      a.student?.batch      ?? "",
      avatar:     a.student?.avatar     ?? "",
      bedNumber:  a.bedNumber,
    }));

    res.json({ roommates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================
// WARDEN → GET ALL STUDENTS
// ===============================
exports.getAllStudents = async (req, res) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 5;
    const { batch, department } = req.query;

    let filter = {};
    if (batch)      filter.batch      = batch;
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
      totalPages:  Math.ceil(totalStudents / limit),
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
    const student = await Student.findOne({ rollNumber: req.params.rollNumber });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ fullName: student.fullName, studentId: student._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};