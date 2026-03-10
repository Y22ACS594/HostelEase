// ============================================================
// controllers/wardenController.js
// Req 1: Duplicate prevention (email, rollNumber, phoneNumber)
// Req 2: Atomic writes using MongoDB transactions
// Req 9: Push notification on room allocation
// Req 11: Audit logging
// ============================================================
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Student = require("../models/Student");
const RoomAllocation = require("../models/RoomAllocation");
const Room = require("../models/Room");
const Payment = require("../models/Payment");
const LeaveRequest = require("../models/LeaveRequest");

const auditLog = require("../utils/auditLogger");
const pushNotification = require("../utils/notificationHelper");

/* ═══════════════════════════════════════════════════════════
   ADD STUDENT  ─  Req 1 + Req 2
   Checks all three unique fields BEFORE touching the DB.
   If User creation succeeds but Student fails, the
   Mongoose session rolls back both writes atomically.
═══════════════════════════════════════════════════════════ */
exports.addStudent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      fullName, email, password, rollNumber, course,
      department, batch, collegeName, gender, dateOfBirth,
      bloodGroup, phoneNumber, aadhaarNumber,
      fatherName, motherName, parentContact, medicalIssues, address,
    } = req.body;

    // ── Req 1: Pre-flight duplicate checks ──────────────────
    const [emailExists, rollExists, phoneExists] = await Promise.all([
      User.findOne({ email }).lean(),
      Student.findOne({ rollNumber }).lean(),
      Student.findOne({ phoneNumber }).lean(),
    ]);

    if (emailExists || rollExists || phoneExists) {
      const fields = [
        emailExists  && "email",
        rollExists   && "roll number",
        phoneExists  && "phone number",
      ].filter(Boolean).join(", ");

      await session.abortTransaction();
      session.endSession();

      return res.status(409).json({
        message: `Duplicate detected for: ${fields}. Registration cancelled — no record created.`,
        duplicates: {
          email: !!emailExists,
          rollNumber: !!rollExists,
          phoneNumber: !!phoneExists,
        },
      });
    }

    // ── Req 2: Atomic write — both docs or neither ──────────
    const hashedPassword = await bcrypt.hash(password, 12);

    const [user] = await User.create(
      [{ name: fullName, email, password: hashedPassword, role: "student" }],
      { session }
    );

    const [student] = await Student.create(
      [{
        user: user._id, fullName, rollNumber, course, department, batch,
        collegeName, gender, dateOfBirth, bloodGroup, phoneNumber,
        aadhaarNumber, fatherName, motherName, parentContact,
        medicalIssues: medicalIssues || "None", address,
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // ── Req 11: Audit log ──────────────────────────────────
    await auditLog({
      actor: req.user.id,
      actorRole: req.user.role,
      action: "STUDENT_REGISTERED",
      targetModel: "Student",
      targetId: student._id,
      description: `Warden registered student ${fullName} (${rollNumber})`,
      ip: req.ip,
    });

    return res.status(201).json({
      message: "Student registered successfully",
      userId: user._id,
      studentId: student._id,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);   // passes to centralised errorHandler
  }
};


/* ═══════════════════════════════════════════════════════════
   GET ALL STUDENTS
═══════════════════════════════════════════════════════════ */
exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await Student
      .find()
      .populate("user", "email role isActive")
      .sort({ createdAt: -1 })
      .lean();

    res.json(students);
  } catch (err) { next(err); }
};


/* ═══════════════════════════════════════════════════════════
   GET FULL STUDENT DETAILS
═══════════════════════════════════════════════════════════ */
exports.getStudentDetails = async (req, res, next) => {
  try {
    const student = await Student
      .findById(req.params.id)
      .populate("user", "email isActive")
      .lean();

    if (!student) return res.status(404).json({ message: "Student not found" });

    const [payments, leaves, room] = await Promise.all([
      Payment.find({ student: student._id }).lean(),
      LeaveRequest.find({ student: student._id }).sort({ createdAt: -1 }).lean(),
      RoomAllocation.findOne({ student: student._id, status: "active" })
        .populate("room").lean(),
    ]);

    res.json({ student, payments, leaves, room });
  } catch (err) { next(err); }
};


/* ═══════════════════════════════════════════════════════════
   UPDATE STUDENT
═══════════════════════════════════════════════════════════ */
exports.updateStudent = async (req, res, next) => {
  try {
    // Guard against overwriting protected fields
    const { user: _u, _id: _i, ...safeUpdates } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      safeUpdates,
      { new: true, runValidators: true }
    );

    if (!student) return res.status(404).json({ message: "Student not found" });

    await auditLog({
      actor: req.user.id,
      actorRole: req.user.role,
      action: "STUDENT_UPDATED",
      targetModel: "Student",
      targetId: student._id,
      description: `Updated profile for ${student.fullName}`,
      ip: req.ip,
    });

    res.json({ message: "Student updated successfully", student });
  } catch (err) { next(err); }
};


/* ═══════════════════════════════════════════════════════════
   DELETE STUDENT  (cascades to all related collections)
═══════════════════════════════════════════════════════════ */
exports.deleteStudent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const student = await Student.findById(req.params.id).session(session);
    if (!student) {
      await session.abortTransaction(); session.endSession();
      return res.status(404).json({ message: "Student not found" });
    }

    await Promise.all([
      RoomAllocation.deleteMany({ student: student._id }).session(session),
      Payment.deleteMany({ student: student._id }).session(session),
      LeaveRequest.deleteMany({ student: student._id }).session(session),
    ]);

    await User.findByIdAndDelete(student.user).session(session);
    await student.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    await auditLog({
      actor: req.user.id,
      actorRole: req.user.role,
      action: "STUDENT_DELETED",
      targetModel: "Student",
      targetId: req.params.id,
      description: `Deleted student ${student.fullName} (${student.rollNumber})`,
      ip: req.ip,
    });

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};


/* ═══════════════════════════════════════════════════════════
   ALLOCATE ROOM  ─  Req 9 (notify student)
═══════════════════════════════════════════════════════════ */
exports.allocateRoom = async (req, res, next) => {
  try {
    const { studentId, room, bedNumber } = req.body;

    const student = await Student.findOne({ rollNumber: studentId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const already = await RoomAllocation.findOne({ student: student._id, status: "active" });
    if (already) return res.status(400).json({ message: "Student already has an active room" });

    const roomDoc = await Room.findById(room);
    if (!roomDoc) return res.status(404).json({ message: "Room not found" });

    const allocation = await RoomAllocation.create({
      student: student._id,
      room,
      bedNumber,
      allocatedBy: req.user.id,
      checkInDate: new Date(),
      status: "active",
    });

    roomDoc.occupiedBeds += 1;
    await roomDoc.save();

    // ── Req 9: Notify student ──────────────────────────────
    await pushNotification(
      student.user,
      "ROOM_ALLOCATED",
      "Room Allocated 🏠",
      `You have been allocated Room ${roomDoc.roomNumber}, Bed ${bedNumber}.`,
      { model: "RoomAllocation", id: allocation._id }
    );

    await auditLog({
      actor: req.user.id,
      actorRole: req.user.role,
      action: "ROOM_ALLOCATED",
      targetModel: "RoomAllocation",
      targetId: allocation._id,
      description: `Room ${roomDoc.roomNumber} bed ${bedNumber} allocated to ${student.fullName}`,
      ip: req.ip,
    });

    res.status(201).json({ message: "Room allocated successfully", allocation });
  } catch (err) { next(err); }
};


/* ═══════════════════════════════════════════════════════════
   GET OCCUPIED BEDS
═══════════════════════════════════════════════════════════ */
exports.getOccupiedBeds = async (req, res, next) => {
  try {
    const allocations = await RoomAllocation.find({
      room: req.params.roomId,
      status: "active",
    }).lean();

    res.json(allocations.map((a) => a.bedNumber));
  } catch (err) { next(err); }
};


/* ═══════════════════════════════════════════════════════════
   GET BED DETAILS
═══════════════════════════════════════════════════════════ */
exports.getBedDetails = async (req, res, next) => {
  try {
    const allocation = await RoomAllocation
      .findOne({
        room: req.params.roomId,
        bedNumber: req.params.bedNumber,
        status: "active",
      })
      .populate("student");

    if (!allocation) return res.status(404).json({ message: "Bed is empty" });

    res.json({
      studentName: allocation.student.fullName,
      rollNumber: allocation.student.rollNumber,
      allocationId: allocation._id,
    });
  } catch (err) { next(err); }
};


/* ═══════════════════════════════════════════════════════════
   REMOVE BED (CHECK-OUT)
═══════════════════════════════════════════════════════════ */
exports.removeBed = async (req, res, next) => {
  try {
    const allocation = await RoomAllocation.findById(req.params.allocationId);
    if (!allocation) return res.status(404).json({ message: "Allocation not found" });

    const room = await Room.findById(allocation.room);
    if (room) { room.occupiedBeds = Math.max(0, room.occupiedBeds - 1); await room.save(); }

    allocation.status = "checkedOut";
    allocation.checkOutDate = new Date();
    await allocation.save();

    res.json({ message: "Student checked out successfully" });
  } catch (err) { next(err); }
};
