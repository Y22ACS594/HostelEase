// controllers/issueController.js
const Issue            = require("../models/Issue");
const Student          = require("../models/Student");
const User             = require("../models/User");
const pushNotification = require("../utils/notificationHelper");
const auditLog         = require("../utils/auditLogger");

const PRIORITY_ICON = { Low:"🟢", Medium:"🟡", High:"🟠", Urgent:"🔴" };

/* ── STUDENT: Raise new issue ──────────────────────────── */
exports.raiseIssue = async (req, res, next) => {
  try {
    const { title, description, category, priority, attachments } = req.body;

    const student = await Student.findOne({ user: req.user.id }).lean();
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const issue = await Issue.create({
      student: student._id,
      title, description, category,
      priority: priority || "Medium",
      attachments: attachments || [],
    });

    // Notify all wardens
    const wardens = await User.find({ role: "warden" }).select("_id").lean();
    const icon = PRIORITY_ICON[priority || "Medium"];

    await Promise.all(wardens.map((w) =>
      pushNotification(
        w._id,
        "GENERAL",
        `${icon} New Issue: ${title}`,
        `${student.fullName} raised a ${priority || "Medium"} priority ${category} issue. "${description.slice(0, 80)}${description.length > 80 ? "…" : ""}"`,
        { model: "Issue", id: issue._id }
      )
    ));

    res.status(201).json(issue);
  } catch (err) { next(err); }
};

/* ── STUDENT: Get my issues ────────────────────────────── */
exports.getMyIssues = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id }).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });

    const issues = await Issue.find({ student: student._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(issues);
  } catch (err) { next(err); }
};

/* ── WARDEN: Get all issues (paginated + filtered) ─────── */
exports.getAllIssues = async (req, res, next) => {
  try {
    const { status, priority, category, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .populate({ path: "student", select: "fullName rollNumber department room" })
        .sort({ priority: 1, createdAt: -1 }) // Urgent first, then newest
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Issue.countDocuments(filter),
    ]);

    res.json({
      issues,
      pagination: { total, page: Number(page), limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) { next(err); }
};

/* ── WARDEN: Update issue status / resolve ─────────────── */
exports.updateIssueStatus = async (req, res, next) => {
  try {
    const { status, resolution } = req.body;

    const issue = await Issue.findById(req.params.id)
      .populate({ path: "student", populate: { path: "user", select: "_id name" } });

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const prevStatus = issue.status;
    issue.status     = status;
    issue.resolution = resolution || issue.resolution;

    if (status === "Resolved" || status === "Closed") {
      issue.resolvedBy = req.user.id;
      issue.resolvedAt = new Date();
    }

    await issue.save();

    // Notify student
    const studentUserId = issue.student?.user?._id;
    if (studentUserId && (status === "Resolved" || status === "Closed" || status === "In Progress")) {
      const titles = {
        "In Progress": "🔧 Issue In Progress",
        "Resolved":    "✅ Issue Resolved",
        "Closed":      "🔒 Issue Closed",
      };
      const msgs = {
        "In Progress": `Your issue "${issue.title}" is now being worked on by the warden team.`,
        "Resolved":    `Your issue "${issue.title}" has been resolved.${resolution ? ` Resolution: ${resolution}` : ""}`,
        "Closed":      `Your issue "${issue.title}" has been closed.`,
      };

      await pushNotification(
        studentUserId,
        "COMPLAINT_RESOLVED",
        titles[status] || `Issue ${status}`,
        msgs[status] || `Your issue status updated to ${status}.`,
        { model: "Issue", id: issue._id }
      );
    }

    await auditLog({
      actor: req.user.id, actorRole: req.user.role,
      action: "ISSUE_UPDATED",
      targetModel: "Issue", targetId: issue._id,
      description: `Issue "${issue.title}" changed from ${prevStatus} to ${status}`,
      ip: req.ip,
    });

    res.json({ message: `Issue ${status.toLowerCase()} successfully`, issue });
  } catch (err) { next(err); }
};

/* ── WARDEN: Get issue stats ───────────────────────────── */
exports.getIssueStats = async (req, res, next) => {
  try {
    const [total, open, inProgress, resolved, urgent] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: "Open" }),
      Issue.countDocuments({ status: "In Progress" }),
      Issue.countDocuments({ status: "Resolved" }),
      Issue.countDocuments({ priority: "Urgent", status: { $in: ["Open","In Progress"] } }),
    ]);

    const byCategory = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ total, open, inProgress, resolved, urgent, byCategory });
  } catch (err) { next(err); }
};