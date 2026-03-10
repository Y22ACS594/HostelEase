// ============================================================
// controllers/leaveController.js
// Req 6: Advanced filters  |  Req 7: Rejection reason
// Req 9: Notify on approve/reject  |  Req 11: Audit log
// ============================================================
const LeaveRequest = require("../models/LeaveRequest");
const Student = require("../models/Student");
const auditLog = require("../utils/auditLogger");
const pushNotification = require("../utils/notificationHelper");
const { sendEmail, buildLeaveStatusEmail } = require("../utils/sendEmail");


/* ═══════════════════════════════════════════════════════════
   STUDENT → APPLY LEAVE
═══════════════════════════════════════════════════════════ */
exports.applyLeave = async (req, res, next) => {
  try {
    const { leaveType, reason, fromDate, toDate, destination, emergencyContact } = req.body;

    if (!leaveType || !reason || !fromDate || !toDate || !destination || !emergencyContact) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (reason.length < 10) {
      return res.status(400).json({ message: "Reason must be at least 10 characters" });
    }
    if (new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({ message: "fromDate cannot be after toDate" });
    }

    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const leave = await LeaveRequest.create({
      student: student._id,
      leaveType, reason, fromDate, toDate, destination, emergencyContact,
    });

    res.status(201).json(leave);
  } catch (err) { next(err); }
};


/* ═══════════════════════════════════════════════════════════
   STUDENT → VIEW OWN LEAVES
═══════════════════════════════════════════════════════════ */
exports.getMyLeaves = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const leaves = await LeaveRequest
      .find({ student: student._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(leaves);
  } catch (err) { next(err); }
};


/* ═══════════════════════════════════════════════════════════
   WARDEN → GET ALL LEAVES  (Req 6: Filters)
   Query params:  studentName | department | batch | leaveType | status
                  page | limit | fromDate | toDate
═══════════════════════════════════════════════════════════ */
exports.getAllLeaves = async (req, res, next) => {
  try {
    const {
      studentName, department, batch,
      leaveType, status,
      page = 1, limit = 20,
      fromDate, toDate,
    } = req.query;

    // Build the student filter
    const studentFilter = {};
    if (studentName) studentFilter.fullName = { $regex: studentName, $options: "i" };
    if (department)  studentFilter.department = { $regex: department, $options: "i" };
    if (batch)       studentFilter.batch = batch;

    let studentIds;
    if (Object.keys(studentFilter).length > 0) {
      const students = await Student.find(studentFilter).select("_id").lean();
      studentIds = students.map((s) => s._id);
    }

    // Build the leave filter
    const leaveFilter = {};
    if (studentIds)  leaveFilter.student = { $in: studentIds };
    if (leaveType)   leaveFilter.leaveType = leaveType;
    if (status)      leaveFilter.status = status;
    if (fromDate || toDate) {
      leaveFilter.fromDate = {};
      if (fromDate) leaveFilter.fromDate.$gte = new Date(fromDate);
      if (toDate)   leaveFilter.fromDate.$lte = new Date(toDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [leaves, total] = await Promise.all([
      LeaveRequest.find(leaveFilter)
        .populate({
          path: "student",
          select: "fullName rollNumber department batch",
        })
        .populate("approvedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      LeaveRequest.countDocuments(leaveFilter),
    ]);

    res.json({
      leaves,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) { next(err); }
};


/* ═══════════════════════════════════════════════════════════
   WARDEN → APPROVE / REJECT  (Req 7, 9, 11)
   Rejected leaves MUST include a rejectionReason
═══════════════════════════════════════════════════════════ */
exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, remarks, rejectionReason } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'Approved' or 'Rejected'" });
    }

    // Req 7: rejection reason is mandatory
    if (status === "Rejected" && (!rejectionReason || rejectionReason.trim().length < 5)) {
      return res.status(400).json({
        message: "A rejection reason (min 5 characters) is required when rejecting a leave.",
      });
    }

    const leave = await LeaveRequest.findById(req.params.id)
      .populate({ path: "student", populate: { path: "user", select: "email name" } });

    if (!leave) return res.status(404).json({ message: "Leave request not found" });

    if (leave.status !== "Pending") {
      return res.status(400).json({ message: "Only pending leaves can be updated" });
    }

    leave.status = status;
    leave.remarks = remarks || "";
    leave.rejectionReason = status === "Rejected" ? rejectionReason : undefined;
    leave.approvedBy = req.user.id;
    await leave.save();

    const studentUser = leave.student?.user;

    // ── Req 9: In-app notification ─────────────────────────
    if (studentUser) {
      const notifType = status === "Approved" ? "LEAVE_APPROVED" : "LEAVE_REJECTED";
      const notifTitle = status === "Approved" ? "Leave Approved ✅" : "Leave Rejected ❌";
      const notifMsg = status === "Approved"
        ? `Your ${leave.leaveType} leave has been approved.`
        : `Your ${leave.leaveType} leave was rejected. Reason: ${rejectionReason}`;

      await pushNotification(studentUser._id, notifType, notifTitle, notifMsg, {
        model: "LeaveRequest",
        id: leave._id,
      });

      // Email notification (best-effort — don't fail the request if email fails)
      try {
        await sendEmail(
          studentUser.email,
          `SmartHostel: Leave ${status}`,
          buildLeaveStatusEmail(studentUser.name, status, leave.leaveType, rejectionReason)
        );
      } catch (emailErr) {
        console.error("Leave status email failed:", emailErr.message);
      }
    }

    // ── Req 11: Audit log ──────────────────────────────────
    await auditLog({
      actor: req.user.id,
      actorRole: req.user.role,
      action: status === "Approved" ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
      targetModel: "LeaveRequest",
      targetId: leave._id,
      description: `Leave ${status.toLowerCase()} for student ${leave.student?.fullName}${status === "Rejected" ? ` — Reason: ${rejectionReason}` : ""}`,
      ip: req.ip,
    });

    res.json({ message: `Leave ${status.toLowerCase()} successfully`, leave });
  } catch (err) { next(err); }
};


/* ═══════════════════════════════════════════════════════════
   WARDEN → LEAVE STATISTICS  (Req 4 + 5)
   Returns counts and chart data for the Leave Dashboard
═══════════════════════════════════════════════════════════ */
exports.getLeaveStats = async (req, res, next) => {
  try {
    // Overall counts
    const [total, approved, pending, rejected] = await Promise.all([
      LeaveRequest.countDocuments(),
      LeaveRequest.countDocuments({ status: "Approved" }),
      LeaveRequest.countDocuments({ status: "Pending" }),
      LeaveRequest.countDocuments({ status: "Rejected" }),
    ]);

    // Monthly requests for the current year
    const year = new Date().getFullYear();
    const monthly = await LeaveRequest.aggregate([
      { $match: { createdAt: { $gte: new Date(`${year}-01-01`) } } },
      { $group: {
        _id: { month: { $month: "$createdAt" }, status: "$status" },
        count: { $sum: 1 },
      }},
      { $sort: { "_id.month": 1 } },
    ]);

    // Leave type distribution
    const byType = await LeaveRequest.aggregate([
      { $group: { _id: "$leaveType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Department-wise leave stats
    const byDepartment = await LeaveRequest.aggregate([
      { $lookup: {
        from: "students",
        localField: "student",
        foreignField: "_id",
        as: "studentData",
      }},
      { $unwind: "$studentData" },
      { $group: {
        _id: "$studentData.department",
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] } },
        pending:  { $sum: { $cond: [{ $eq: ["$status", "Pending"] },  1, 0] } },
      }},
      { $sort: { total: -1 } },
    ]);

    res.json({
      summary: { total, approved, pending, rejected },
      monthly,
      byType,
      byDepartment,
    });
  } catch (err) { next(err); }
};
