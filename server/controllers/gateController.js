// server/controllers/gateController.js
// Handles all gatekeeper portal operations:
//   - View today's approved leave list
//   - Search student by roll number
//   - Mark exit / deny at gate
//   - Get exit logs
//   - Warden triggers "send list to gatekeeper" email

const LeaveRequest = require("../models/LeaveRequest");
const Student      = require("../models/Student");
const User         = require("../models/User");
const auditLog     = require("../utils/auditLogger");
const { sendEmail }= require("../utils/sendEmail");

// ── helpers ──────────────────────────────────────────────────────────
const todayRange = () => {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end   = new Date(); end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Leaves that are "active today" = Approved AND fromDate <= today <= toDate
const activeLeaveFilter = () => {
  const today = new Date();
  return {
    status:   "Approved",
    toDate:   { $gte: today },
  };
};

// ── GET /api/gate/approved-list ───────────────────────────────────────
// Returns all approved students whose leave covers today
exports.getApprovedList = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find(activeLeaveFilter())
      .populate({
        path: "student",
        select: "fullName rollNumber department batch roomNumber phone",
      })
      .populate("approvedBy",  "name")
      .populate("exitMarkedBy","name")
      .sort({ fromDate: 1 })
      .lean();

    res.json({ leaves, total: leaves.length });
  } catch (err) { next(err); }
};

// ── GET /api/gate/search?roll=Y22ACS594 ───────────────────────────────
// Gatekeeper searches by roll number to get leave status
exports.searchStudent = async (req, res, next) => {
  try {
    const { roll } = req.query;
    if (!roll) return res.status(400).json({ message: "roll query param required" });

    const student = await Student.findOne({
      rollNumber: { $regex: new RegExp(`^${roll.trim()}$`, "i") },
    }).lean();

    if (!student) return res.status(404).json({ message: "Student not found" });

    // Find their most recent approved leave that covers today
    const today = new Date();
    const leave = await LeaveRequest.findOne({
      student:  student._id,
      status:   "Approved",
      fromDate: { $lte: today },
      toDate:   { $gte: today },
    })
      .populate("approvedBy",  "name")
      .populate("exitMarkedBy","name")
      .sort({ createdAt: -1 })
      .lean();

    // Also check if there's any pending/rejected leave for context
    const latestLeave = leave || await LeaveRequest.findOne({
      student: student._id,
    }).sort({ createdAt: -1 }).lean();

    res.json({
      student,
      leave: leave || null,
      latestLeave: latestLeave || null,
      hasActiveApproval: !!leave,
    });
  } catch (err) { next(err); }
};

// ── PUT /api/gate/mark-exit/:leaveId ─────────────────────────────────
// Gatekeeper marks a student as exited
exports.markExit = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.leaveId)
      .populate({ path: "student", select: "fullName rollNumber" });

    if (!leave) return res.status(404).json({ message: "Leave request not found" });
    if (leave.status !== "Approved") return res.status(400).json({ message: "Leave is not approved" });
    if (leave.gateStatus === "Exited") return res.status(400).json({ message: "Student has already exited" });

    leave.gateStatus   = "Exited";
    leave.exitedAt     = new Date();
    leave.exitMarkedBy = req.user.id;
    await leave.save();

    await auditLog({
      actor:       req.user.id,
      actorRole:   req.user.role,
      action:      "GATE_EXIT_MARKED",
      targetModel: "LeaveRequest",
      targetId:    leave._id,
      description: `Gate exit marked for ${leave.student?.fullName} (${leave.student?.rollNumber})`,
      ip:          req.ip,
    });

    res.json({ message: "Exit marked successfully", leave });
  } catch (err) { next(err); }
};

// ── PUT /api/gate/deny/:leaveId ───────────────────────────────────────
// Gatekeeper denies exit at gate even if approved
exports.denyAtGate = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 3)
      return res.status(400).json({ message: "A reason is required to deny exit" });

    const leave = await LeaveRequest.findById(req.params.leaveId)
      .populate({ path: "student", select: "fullName rollNumber" });

    if (!leave) return res.status(404).json({ message: "Leave request not found" });
    if (leave.status !== "Approved") return res.status(400).json({ message: "Leave is not approved" });

    leave.gateStatus      = "Denied";
    leave.gateDeniedReason= reason.trim();
    leave.exitMarkedBy    = req.user.id;
    await leave.save();

    await auditLog({
      actor:       req.user.id,
      actorRole:   req.user.role,
      action:      "GATE_EXIT_DENIED",
      targetModel: "LeaveRequest",
      targetId:    leave._id,
      description: `Gate exit denied for ${leave.student?.fullName} — ${reason}`,
      ip:          req.ip,
    });

    res.json({ message: "Exit denied at gate", leave });
  } catch (err) { next(err); }
};

// ── GET /api/gate/exit-logs?date=2025-04-01 ──────────────────────────
// Returns today's exit log (or specific date)
exports.getExitLogs = async (req, res, next) => {
  try {
    const { date } = req.query;
    const d     = date ? new Date(date) : new Date();
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const end   = new Date(d); end.setHours(23, 59, 59, 999);

    const logs = await LeaveRequest.find({
      gateStatus: { $in: ["Exited", "Denied"] },
      exitedAt:   { $gte: start, $lte: end },
    })
      .populate({ path: "student", select: "fullName rollNumber department room" })
      .populate("exitMarkedBy", "name")
      .sort({ exitedAt: -1 })
      .lean();

    res.json({ logs, total: logs.length, date: d.toISOString().slice(0, 10) });
  } catch (err) { next(err); }
};

// ── POST /api/gate/send-list-email ────────────────────────────────────
// Warden sends the approved list to gatekeeper(s) via email
exports.sendApprovedListEmail = async (req, res, next) => {
  try {
    const { gatekeeperEmail } = req.body;
    if (!gatekeeperEmail) return res.status(400).json({ message: "gatekeeperEmail is required" });

    const leaves = await LeaveRequest.find(activeLeaveFilter())
      .populate({ path: "student", select: "fullName rollNumber department batch" })
      .populate("approvedBy", "name")
      .sort({ fromDate: 1 })
      .lean();

    const today     = new Date().toLocaleDateString("en-IN", { dateStyle: "long" });
    const tableRows = leaves.map((l, i) => `
      <tr style="background:${i % 2 === 0 ? "#f9fafb" : "#fff"}">
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${i + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:13px">${l.student?.rollNumber || "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${l.student?.fullName || "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${l.student?.department || "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${String(l.fromDate).slice(0, 10)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${String(l.toDate).slice(0, 10)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${l.destination || "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">
          <span style="background:#d1fae5;color:#065f46;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600">APPROVED</span>
        </td>
      </tr>`).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family:'Segoe UI',sans-serif;background:#f3f4f6;margin:0;padding:24px">
        <div style="max-width:800px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
          <div style="background:linear-gradient(135deg,#059669,#047857);padding:28px 32px;color:#fff">
            <div style="font-size:11px;letter-spacing:0.1em;opacity:0.8;margin-bottom:4px">HOSTELEASE · GATEKEEPER LIST</div>
            <h1 style="margin:0;font-size:22px;font-weight:700">Approved Leave List</h1>
            <p style="margin:6px 0 0;opacity:0.85;font-size:13px">Date: ${today} · Total: ${leaves.length} students</p>
          </div>
          <div style="padding:24px 32px">
            ${leaves.length === 0
              ? `<p style="color:#6b7280;text-align:center;padding:32px">No approved leaves for today.</p>`
              : `<table style="width:100%;border-collapse:collapse;font-size:13px">
                  <thead>
                    <tr style="background:#f0fdf4">
                      <th style="padding:10px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">#</th>
                      <th style="padding:10px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Roll No.</th>
                      <th style="padding:10px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Name</th>
                      <th style="padding:10px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Dept</th>
                      <th style="padding:10px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">From</th>
                      <th style="padding:10px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">To</th>
                      <th style="padding:10px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Destination</th>
                      <th style="padding:10px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Status</th>
                    </tr>
                  </thead>
                  <tbody>${tableRows}</tbody>
                </table>`}
            <div style="margin-top:24px;padding:16px;background:#f0fdf4;border-radius:10px;border-left:4px solid #059669">
              <p style="margin:0;font-size:12px;color:#065f46">
                <strong>Instructions for Gatekeeper:</strong> Cross-check the student's Roll Number against this list before allowing exit.
                Only students listed here with APPROVED status are permitted to leave the hostel premises.
              </p>
            </div>
            <p style="margin-top:20px;font-size:11px;color:#9ca3af;text-align:center">
              Sent by HostelEase · ${today}
            </p>
          </div>
        </div>
      </body>
      </html>`;

    await sendEmail(
      gatekeeperEmail,
      `[HostelEase] Approved Leave List – ${today}`,
      html
    );

    await auditLog({
      actor:       req.user.id,
      actorRole:   req.user.role,
      action:      "GATE_LIST_EMAIL_SENT",
      description: `Approved list emailed to gatekeeper (${gatekeeperEmail}) — ${leaves.length} students`,
      ip:          req.ip,
    });

    res.json({ message: `Approved list emailed to ${gatekeeperEmail}`, count: leaves.length });
  } catch (err) { next(err); }
};

// ── GET /api/gate/stats ───────────────────────────────────────────────
// Quick stats for gatekeeper dashboard
exports.getGateStats = async (req, res, next) => {
  try {
    const filter = activeLeaveFilter();
    const [totalApproved, exited, denied] = await Promise.all([
      LeaveRequest.countDocuments(filter),
      LeaveRequest.countDocuments({ ...filter, gateStatus: "Exited" }),
      LeaveRequest.countDocuments({ ...filter, gateStatus: "Denied" }),
    ]);
    res.json({
      totalApproved,
      exited,
      denied,
      pendingExit: totalApproved - exited - denied,
    });
  } catch (err) { next(err); }
};