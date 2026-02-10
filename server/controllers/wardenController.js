const User = require("../models/User");
const Student = require("../models/Student");
const RoomAllocation = require("../models/RoomAllocation");
const Room = require("../models/Room");
const bcrypt = require("bcryptjs");

/* ===============================
   ADD STUDENT (Warden)
   - creates User
   - creates Student
================================ */
exports.addStudent = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      rollNumber,
      course,
      department,
      year,
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
    } = req.body;

    // 🔍 check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Student already exists" });
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1️⃣ create USER (login)
    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      role: "student",
    });

    // 2️⃣ create STUDENT (profile)
    const student = await Student.create({
      user: user._id,
      fullName,
      rollNumber,
      course,
      department,
      year,
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
    });

    res.status(201).json({
      message: "Student registered successfully",
      userId: user._id,      // 🔥 THIS is used for allocation
      studentId: student._id // internal use
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   ALLOCATE ROOM (Warden)
   - frontend sends USER ID
   - backend converts to STUDENT
================================ */
exports.allocateRoom = async (req, res) => {
  try {
    const { studentId, room, bedNumber } = req.body;
    // ⚠️ studentId = USER ID (from users collection)

    // 🔥 find student using USER ID
    const student = await Student.findOne({ user: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🔁 prevent double allocation
    const already = await RoomAllocation.findOne({ student: student._id });
    if (already) {
      return res.status(400).json({ message: "Room already allocated" });
    }

    // 🏠 check room
    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (roomDoc.occupiedBeds >= roomDoc.totalBeds) {
      return res.status(400).json({ message: "Room is full" });
    }

    // 🛏 allocate
    const allocation = await RoomAllocation.create({
      student: student._id,   // ✅ always STUDENT ID internally
      room: roomDoc._id,
      bedNumber,
      allocatedBy: req.user.id,
    });

    // ➕ update room count
    roomDoc.occupiedBeds += 1;
    await roomDoc.save();

    res.status(201).json({
      message: "Room allocated successfully",
      allocation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
