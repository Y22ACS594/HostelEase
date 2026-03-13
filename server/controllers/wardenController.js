// controllers/wardenController.js  — with full notification triggers
const mongoose         = require("mongoose");
const bcrypt           = require("bcryptjs");
const User             = require("../models/User");
const Student          = require("../models/Student");
const Room             = require("../models/Room");
const RoomAllocation   = require("../models/RoomAllocation");
const Payment          = require("../models/Payment");
const LeaveRequest     = require("../models/LeaveRequest");
const auditLog         = require("../utils/auditLogger");
const pushNotification = require("../utils/notificationHelper");

/* ── ADD STUDENT ──────────────────────────────────────────────── */
exports.addStudent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      fullName, email, password, rollNumber, phoneNumber,
      course, department, batch, collegeName, gender,
      dateOfBirth, bloodGroup, aadhaarNumber,
      fatherName, motherName, parentContact, medicalIssues, address,
    } = req.body;

    const [emailExists, rollExists, phoneExists] = await Promise.all([
      User.findOne({ email }).lean(),
      Student.findOne({ rollNumber }).lean(),
      Student.findOne({ phoneNumber }).lean(),
    ]);

    if (emailExists || rollExists || phoneExists) {
      await session.abortTransaction(); session.endSession();
      return res.status(409).json({ message: "Duplicate student data detected" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [user] = await User.create([{
      name: fullName, email, password: hashedPassword, role: "student",
    }], { session });

    const [student] = await Student.create([{
      user: user._id, fullName, rollNumber, phoneNumber,
      course, department, batch, collegeName, gender,
      dateOfBirth, bloodGroup, aadhaarNumber,
      fatherName, motherName, parentContact, medicalIssues, address,
    }], { session });

    await session.commitTransaction(); session.endSession();

    // ── Welcome notification to student ────────────────────
    await pushNotification(
      user._id,
      "STUDENT_REGISTERED",
      "🎉 Welcome to HostelEase!",
      `Hello ${fullName}! Your hostel account has been created. ` +
      `Roll: ${rollNumber} | Department: ${department}. ` +
      `You can now apply for leaves, view room status and track payments.`,
      { model: "Student", id: student._id }
    );

    await auditLog({
      actor: req.user.id, actorRole: req.user.role,
      action: "STUDENT_CREATED", targetModel: "Student", targetId: student._id,
      description: `Student ${fullName} registered`, ip: req.ip,
    });

    res.status(201).json({ message: "Student created successfully", studentId: student._id });
  } catch (err) {
    await session.abortTransaction(); session.endSession(); next(err);
  }
};

/* ── GET ALL STUDENTS ─────────────────────────────────────────── */
exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find().populate("user", "email role").sort({ createdAt: -1 });
    res.json(students);
  } catch (err) { next(err); }
};

/* ── GET STUDENT DETAILS ──────────────────────────────────────── */
exports.getStudentDetails = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate("user", "email");
    if (!student) return res.status(404).json({ message: "Student not found" });
    const [payments, leaves, room] = await Promise.all([
      Payment.find({ student: student._id }),
      LeaveRequest.find({ student: student._id }),
      RoomAllocation.findOne({ student: student._id, status: "active" }).populate("room"),
    ]);
    res.json({ student, payments, leaves, room });
  } catch (err) { next(err); }
};

/* ── UPDATE STUDENT ───────────────────────────────────────────── */
exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    await auditLog({
      actor: req.user.id, actorRole: req.user.role,
      action: "STUDENT_UPDATED", targetModel: "Student", targetId: student._id,
      description: "Student updated",
    });
    res.json(student);
  } catch (err) { next(err); }
};

/* ── DELETE STUDENT ───────────────────────────────────────────── */
exports.deleteStudent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const student = await Student.findById(req.params.id).session(session);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await Promise.all([
      RoomAllocation.deleteMany({ student: student._id }).session(session),
      Payment.deleteMany({ student: student._id }).session(session),
      LeaveRequest.deleteMany({ student: student._id }).session(session),
    ]);
    await User.findByIdAndDelete(student.user).session(session);
    await student.deleteOne({ session });
    await session.commitTransaction(); session.endSession();
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    await session.abortTransaction(); session.endSession(); next(err);
  }
};

/* ── ROOMS WITH BEDS ──────────────────────────────────────────── */
exports.getRoomsWithBeds = async (req, res, next) => {
  try {
    const rooms       = await Room.find().lean();
    const allocations = await RoomAllocation.find({ status: "active" }).lean();
    const allocationMap = {};
    allocations.forEach((a) => { allocationMap[`${a.room}_${a.bedNumber}`] = true; });
    const result = rooms.map((room) => {
      const beds = [];
      for (let i = 1; i <= room.totalBeds; i++) {
        beds.push({ number: String(i), status: allocationMap[`${room._id}_${i}`] ? "occupied" : "available" });
      }
      return { ...room, beds };
    });
    res.json(result);
  } catch (err) { next(err); }
};

/* ── ALLOCATE ROOM ────────────────────────────────────────────── */
exports.allocateRoom = async (req, res, next) => {
  try {
    const { studentId, room, bedNumber } = req.body;

    const student = await Student.findOne({ rollNumber: studentId }).populate("user", "_id");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const already = await RoomAllocation.findOne({ student: student._id, status: "active" });
    if (already) return res.status(400).json({ message: "Student already has room" });

    const bedTaken = await RoomAllocation.findOne({ room, bedNumber, status: "active" });
    if (bedTaken) return res.status(400).json({ message: "Bed already occupied" });

    const roomDoc = await Room.findById(room).lean();

    const allocation = await RoomAllocation.create({
      student: student._id, room, bedNumber, allocatedBy: req.user.id,
    });

    // ── Notify student ────────────────────────────────────
    if (student.user?._id) {
      await pushNotification(
        student.user._id,
        "ROOM_ALLOCATED",
        "🏠 Room Allocated",
        `You have been allocated Room ${roomDoc?.roomNumber || room}, Bed ${bedNumber} ` +
        `in Block ${roomDoc?.blockName || ""}. Welcome to your new room!`,
        { model: "RoomAllocation", id: allocation._id }
      );
    }

    await auditLog({
      actor: req.user.id, actorRole: req.user.role,
      action: "ROOM_ALLOCATED", targetModel: "RoomAllocation", targetId: allocation._id,
      description: `Room ${roomDoc?.roomNumber} Bed ${bedNumber} allocated to ${student.fullName}`,
      ip: req.ip,
    });

    res.status(201).json({ message: "Room allocated successfully", allocation });
  } catch (err) { next(err); }
};

/* ── GET BED DETAILS ──────────────────────────────────────────── */
exports.getBedDetails = async (req, res, next) => {
  try {
    const allocation = await RoomAllocation.findOne({
      room: req.params.roomId, bedNumber: req.params.bedNumber, status: "active",
    }).populate("student");
    if (!allocation) return res.status(404).json({ message: "Bed empty" });
    res.json({
      studentName: allocation.student.fullName,
      rollNumber:  allocation.student.rollNumber,
      allocationId: allocation._id,
    });
  } catch (err) { next(err); }
};

/* ── DEALLOCATE BED ───────────────────────────────────────────── */
exports.removeBed = async (req, res, next) => {
  try {
    const allocation = await RoomAllocation.findById(req.params.allocationId)
      .populate({ path: "student", populate: { path: "user", select: "_id" } })
      .populate("room");

    if (!allocation) return res.status(404).json({ message: "Allocation not found" });

    allocation.status       = "checkedOut";
    allocation.checkOutDate = new Date();
    await allocation.save();

    // ── Notify student ────────────────────────────────────
    const studentUserId = allocation.student?.user?._id;
    if (studentUserId) {
      await pushNotification(
        studentUserId,
        "ROOM_DEALLOCATED",
        "🏠 Room Deallocated",
        `Your allocation for Room ${allocation.room?.roomNumber || ""}, ` +
        `Bed ${allocation.bedNumber} has been removed by the warden.`,
        { model: "RoomAllocation", id: allocation._id }
      );
    }

    await auditLog({
      actor: req.user.id, actorRole: req.user.role,
      action: "ROOM_DEALLOCATED", targetModel: "RoomAllocation", targetId: allocation._id,
      description: `Bed ${allocation.bedNumber} deallocated from ${allocation.student?.fullName}`,
      ip: req.ip,
    });

    res.json({ message: "Bed deallocated successfully" });
  } catch (err) { next(err); }
};

/* ── GET OCCUPIED BEDS ────────────────────────────────────────── */
exports.getOccupiedBeds = async (req, res, next) => {
  try {
    const allocations = await RoomAllocation.find({ room: req.params.roomId, status: "active" });
    res.json(allocations.map((a) => String(a.bedNumber)));
  } catch (err) { next(err); }
};