const LeaveRequest = require("../models/LeaveRequest");
const Student = require("../models/Student");

// STUDENT → Apply Leave
exports.applyLeave = async (req, res) => {
  try {
    const {
      leaveType,
      reason,
      fromDate,
      toDate,
      destination,
      emergencyContact,
    } = req.body;

    if (
      !leaveType ||
      !reason ||
      !fromDate ||
      !toDate ||
      !destination ||
      !emergencyContact
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (reason.length < 10) {
      return res
        .status(400)
        .json({ message: "Reason must be at least 10 characters" });
    }

    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const leave = await LeaveRequest.create({
      student: student._id,
      leaveType,
      reason,
      fromDate,
      toDate,
      destination,
      emergencyContact,
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// STUDENT → View own leaves
exports.getMyLeaves = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    const leaves = await LeaveRequest.find({ student: student._id }).sort({
      createdAt: -1,
    });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// WARDEN → View all leaves
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate("student")
      .populate("approvedBy", "name email");

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// WARDEN → Approve / Reject
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    leave.status = status;
    leave.remarks = remarks;
    leave.approvedBy = req.user.id;

    await leave.save();
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
