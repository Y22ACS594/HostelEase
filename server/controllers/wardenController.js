const User = require("../models/User");
const Student = require("../models/Student");
const RoomAllocation = require("../models/RoomAllocation");
const Room = require("../models/Room");
const Payment = require("../models/Payment");
const LeaveRequest = require("../models/LeaveRequest");
const bcrypt = require("bcryptjs");

/* ===============================
   ADD STUDENT (Warden)
================================ */
exports.addStudent = async (req, res) => {
  try {
    console.log("Req Body:", req.body);

    const {
      fullName,
      email,
      password,
      rollNumber,
      course,
      department,
      batch,
      collegeName,
      gender,
      dateOfBirth,
      bloodGroup,
      phoneNumber,
      aadhaarNumber,
      fatherName,
      motherName,
      parentContact,
      medicalIssues,
      address
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Student already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      role: "student"
    });

    const student = await Student.create({
      user: user._id,
      fullName,
      rollNumber,
      course,
      department,
      batch,
      collegeName,
      gender,
      dateOfBirth,
      bloodGroup,
      phoneNumber,
      aadhaarNumber,
      fatherName,
      motherName,
      parentContact,
      medicalIssues,
      address
    });

    res.status(201).json({
      message: "Student registered successfully",
      userId: user._id,
      studentId: student._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};


/* ===============================
   GET ALL STUDENTS
================================ */
exports.getAllStudents = async (req, res) => {
  try {

    const students = await Student
      .find()
      .populate("user", "email role")
      .sort({ createdAt: -1 });

    res.json(students);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};


/* ===============================
   GET FULL STUDENT DETAILS
================================ */
exports.getStudentDetails = async (req, res) => {
  try {

    const student = await Student
      .findById(req.params.id)
      .populate("user", "email");

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const payments = await Payment.find({ student: student._id });

    const leaves = await LeaveRequest.find({ student: student._id });

        const room = await RoomAllocation
      .findOne({ student: student._id })
      .populate("room")
      .sort({ createdAt: -1 });
    res.json({
      student,
      payments,
      leaves,
      room
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};


/* ===============================
   UPDATE STUDENT
================================ */
exports.updateStudent = async (req, res) => {
  try {

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    Object.assign(student, req.body);

    await student.save();

    res.status(200).json({
      message: "Student updated successfully",
      student
    });

  } catch (error) {
    res.status(500).json({
      message: "Update failed",
      error: error.message
    });
  }
};


/* ===============================
   DELETE STUDENT COMPLETELY
================================ */
exports.deleteStudent = async (req, res) => {
  try {

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    await RoomAllocation.deleteMany({ student: student._id });
    await Payment.deleteMany({ student: student._id });
    await LeaveRequest.deleteMany({ student: student._id });

    await User.findByIdAndDelete(student.user);

    await student.deleteOne();

    res.status(200).json({
      message: "Student deleted successfully"
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};


/* ===============================
   ALLOCATE ROOM (CHECK-IN)
================================ */
exports.allocateRoom = async (req, res) => {
  try {

    const { studentId, room, bedNumber } = req.body;

    const student = await Student.findOne({
      rollNumber: studentId
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const already = await RoomAllocation.findOne({
      student: student._id,
      status: "active"
    });

    if (already) {
      return res.status(400).json({
        message: "Student already has a room allocated"
      });
    }

    const roomDoc = await Room.findById(room);

    if (!roomDoc) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    const allocation = await RoomAllocation.create({
      student: student._id,
      room,
      bedNumber,
      allocatedBy: req.user.id,
      checkInDate: new Date(),
      status: "active"
    });

    roomDoc.occupiedBeds += 1;
    await roomDoc.save();

    res.status(201).json({
      message: "Room allocated successfully",
      allocation
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};


/* ===============================
   GET OCCUPIED BEDS BY ROOM
================================ */
exports.getOccupiedBeds = async (req, res) => {
  try {

    const { roomId } = req.params;

    const allocations = await RoomAllocation.find({
      room: roomId,
      status: "active"
    });

    const occupiedBeds = allocations.map(a => a.bedNumber);

    res.json(occupiedBeds);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};


/* ===============================
   GET BED DETAILS
================================ */
exports.getBedDetails = async (req, res) => {
  try {

    const { roomId, bedNumber } = req.params;

    const allocation = await RoomAllocation
      .findOne({
        room: roomId,
        bedNumber: bedNumber,
        status: "active"
      })
      .populate("student");

    if (!allocation) {
      return res.status(404).json({
        message: "Bed is empty"
      });
    }

    res.json({
      studentName: allocation.student.fullName,
      rollNumber: allocation.student.rollNumber,
      allocationId: allocation._id
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};


/* ===============================
   REMOVE BED (CHECK-OUT)
================================ */
exports.removeBed = async (req, res) => {
  try {

    const { allocationId } = req.params;

    const allocation = await RoomAllocation.findById(allocationId);

    if (!allocation) {
      return res.status(404).json({
        message: "Allocation not found"
      });
    }

    const room = await Room.findById(allocation.room);

    if (room) {
      room.occupiedBeds -= 1;
      await room.save();
    }

    // ✅ Instead of deleting → mark checkout
    allocation.status = "checkedOut";
    allocation.checkOutDate = new Date();

    await allocation.save();

    res.json({
      message: "Student checked out successfully"
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};