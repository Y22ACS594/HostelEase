// controllers/leaveController.js
// Req 6: Filters | Req 7: Rejection reason
// Req 9: Notify warden on apply, student on decision | Req 11: Audit
const LeaveRequest     = require("../models/LeaveRequest");
const Student          = require("../models/Student");
const User             = require("../models/User");
const auditLog         = require("../utils/auditLogger");
const pushNotification = require("../utils/notificationHelper");
const { sendEmail, buildLeaveStatusEmail } = require("../utils/sendEmail");

/* ── STUDENT → APPLY LEAVE ─────────────────────────────────────── */
exports.applyLeave = async (req, res, next) => {
  try {
    // Accept both field names for backward compatibility
    const {
      leaveType,
      reason,
      fromDate,
      toDate,
      destination,
      emergencyContact,
      contactDuringLeave, // alias sent by frontend
    } = req.body;

    // Resolve emergency contact from either field name
    const contact = emergencyContact || contactDuringLeave || "";

    // Only leaveType, reason, fromDate, toDate are truly required
    if (!leaveType || !reason || !fromDate || !toDate)
      return res.status(400).json({ message: "leaveType, reason, fromDate and toDate are required" });

    if (reason.length < 10)
      return res.status(400).json({ message: "Reason must be at least 10 characters" });

    if (new Date(fromDate) > new Date(toDate))
      return res.status(400).json({ message: "fromDate cannot be after toDate" });

    const student = await Student.findOne({ user: req.user.id }).lean();
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const leave = await LeaveRequest.create({
      student: student._id,
      leaveType,
      reason,
      fromDate,
      toDate,
      destination:      destination || "",
      emergencyContact: contact,
    });

    // ── Notify ALL wardens ──────────────────────────────────────────
    const wardens  = await User.find({ role: "warden" }).select("_id").lean();
    const isUrgent = ["Emergency", "Medical"].includes(leaveType);
    const prefix   = leaveType === "Emergency" ? "🚨 URGENT: "
                   : leaveType === "Medical"   ? "🏥 Medical: " : "";

    const from = String(fromDate).slice(0, 10);
    const to   = String(toDate).slice(0, 10);

    await Promise.all(wardens.map((w) =>
      pushNotification(
        w._id,
        "LEAVE_APPLIED",
        `${prefix}New ${leaveType} Leave Request`,
        `${student.fullName} (${student.department || "—"}) applied for ${leaveType} leave ` +
        `from ${from} to ${to}.${isUrgent ? " Requires immediate attention." : ""}`,
        { model: "LeaveRequest", id: leave._id }
      )
    ));

    res.status(201).json(leave);
  } catch (err) { next(err); }
};

/* ── STUDENT → VIEW OWN LEAVES ────────────────────────────────── */
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

/* ── WARDEN → GET ALL LEAVES (paginated + filtered) ────────────── */
exports.getAllLeaves = async (req, res, next) => {
  try {
    const {
      studentName, department, batch,
      leaveType, status,
      page = 1, limit = 20,
      fromDate, toDate,
    } = req.query;

    const studentFilter = {};
    if (studentName) studentFilter.fullName   = { $regex: studentName, $options: "i" };
    if (department)  studentFilter.department = { $regex: department,  $options: "i" };
    if (batch)       studentFilter.batch      = batch;

    let studentIds;
    if (Object.keys(studentFilter).length > 0) {
      const students = await Student.find(studentFilter).select("_id").lean();
      studentIds = students.map((s) => s._id);
    }

    const leaveFilter = {};
    if (studentIds)        leaveFilter.student   = { $in: studentIds };
    if (leaveType)         leaveFilter.leaveType  = leaveType;
    if (status)            leaveFilter.status     = status;
    if (fromDate || toDate) {
      leaveFilter.fromDate = {};
      if (fromDate) leaveFilter.fromDate.$gte = new Date(fromDate);
      if (toDate)   leaveFilter.fromDate.$lte = new Date(toDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [leaves, total] = await Promise.all([
      LeaveRequest.find(leaveFilter)
        .populate({ path: "student", select: "fullName rollNumber department batch" })
        .populate("approvedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip).limit(Number(limit)).lean(),
      LeaveRequest.countDocuments(leaveFilter),
    ]);

    res.json({
      leaves,
      pagination: { total, page: Number(page), limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) { next(err); }
};

/* ── WARDEN → APPROVE / REJECT ─────────────────────────────────── */
exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, remarks, rejectionReason } = req.body;

    if (!["Approved", "Rejected"].includes(status))
      return res.status(400).json({ message: "Status must be 'Approved' or 'Rejected'" });
    if (status === "Rejected" && (!rejectionReason || rejectionReason.trim().length < 5))
      return res.status(400).json({ message: "Rejection reason (min 5 chars) is required" });

    const leave = await LeaveRequest.findById(req.params.id)
      .populate({ path: "student", populate: { path: "user", select: "email name" } });

    if (!leave) return res.status(404).json({ message: "Leave request not found" });
    if (leave.status !== "Pending")
      return res.status(400).json({ message: "Only pending leaves can be updated" });

    leave.status          = status;
    leave.remarks         = remarks || "";
    leave.rejectionReason = status === "Rejected" ? rejectionReason : undefined;
    leave.approvedBy      = req.user.id;
    await leave.save();

    const studentUser = leave.student?.user;
    if (studentUser) {
      const from = String(leave.fromDate).slice(0, 10);
      const to   = String(leave.toDate).slice(0, 10);

      await pushNotification(
        studentUser._id,
        status === "Approved" ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
        status === "Approved" ? "✅ Leave Approved" : "❌ Leave Rejected",
        status === "Approved"
          ? `Your ${leave.leaveType} leave (${from} → ${to}) has been approved. Have a safe trip!`
          : `Your ${leave.leaveType} leave was rejected. Reason: ${rejectionReason}`,
        { model: "LeaveRequest", id: leave._id }
      );

      try {
        await sendEmail(
          studentUser.email,
          `HostelEase: Leave ${status}`,
          buildLeaveStatusEmail(studentUser.name, status, leave.leaveType, rejectionReason)
        );
      } catch (e) { console.error("Email failed:", e.message); }
    }

    await auditLog({
      actor: req.user.id, actorRole: req.user.role,
      action: status === "Approved" ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
      targetModel: "LeaveRequest", targetId: leave._id,
      description: `Leave ${status.toLowerCase()} for ${leave.student?.fullName}` +
        (status === "Rejected" ? ` — Reason: ${rejectionReason}` : ""),
      ip: req.ip,
    });

    res.json({ message: `Leave ${status.toLowerCase()} successfully`, leave });
  } catch (err) { next(err); }
};

/* ── WARDEN → LEAVE STATISTICS ─────────────────────────────────── */
exports.getLeaveStats = async (req, res, next) => {
  try {
    const [total, approved, pending, rejected] = await Promise.all([
      LeaveRequest.countDocuments(),
      LeaveRequest.countDocuments({ status: "Approved" }),
      LeaveRequest.countDocuments({ status: "Pending"  }),
      LeaveRequest.countDocuments({ status: "Rejected" }),
    ]);

    const year    = new Date().getFullYear();
    const monthly = await LeaveRequest.aggregate([
      { $match: { createdAt: { $gte: new Date(`${year}-01-01`) } } },
      { $group: { _id: { month: { $month: "$createdAt" }, status: "$status" }, count: { $sum: 1 } } },
      { $sort: { "_id.month": 1 } },
    ]);

    const byType = await LeaveRequest.aggregate([
      { $group: { _id: "$leaveType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byDepartment = await LeaveRequest.aggregate([
      { $lookup: { from: "students", localField: "student", foreignField: "_id", as: "s" } },
      { $unwind: "$s" },
      { $group: {
        _id: "$s.department",
        total:    { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ["$status","Approved"] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status","Rejected"] }, 1, 0] } },
        pending:  { $sum: { $cond: [{ $eq: ["$status","Pending"]  }, 1, 0] } },
      }},
      { $sort: { total: -1 } },
    ]);

    res.json({ summary: { total, approved, pending, rejected }, monthly, byType, byDepartment });
  } catch (err) { next(err); }
};