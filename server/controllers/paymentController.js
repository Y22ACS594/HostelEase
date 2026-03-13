// controllers/paymentController.js — notifies warden on payment
const Payment          = require("../models/Payment");
const Student          = require("../models/Student");
const User             = require("../models/User");
const pushNotification = require("../utils/notificationHelper");

// STUDENT: View own payments
exports.getMyPayments = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student not found" });
    const payments = await Payment.find({ student: student._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// STUDENT: Initiate payment
exports.initiatePayment = async (req, res) => {
  try {
    const { amount, academicYear, paymentMode } = req.body;
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const payment = await Payment.create({
      student: student._id, amount, academicYear, paymentMode, paymentStatus: "Pending",
    });
    res.status(201).json(payment);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// STUDENT: Confirm payment (simulate success) + notify wardens
exports.confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({ path: "student", select: "fullName rollNumber department" });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.paymentStatus = "Paid";
    payment.receiptNumber = `HE-${Date.now()}`;
    payment.paidDate      = new Date();
    await payment.save();

    // ── Notify student: receipt confirmed ─────────────────
    const student = await Student.findById(payment.student._id || payment.student)
      .populate("user", "_id");
    if (student?.user?._id) {
      await pushNotification(
        student.user._id,
        "PAYMENT_CONFIRMED",
        "💳 Payment Confirmed",
        `Your hostel fee payment of ₹${payment.amount} for ${payment.academicYear} ` +
        `has been confirmed. Receipt: ${payment.receiptNumber}`,
        { model: "Payment", id: payment._id }
      );
    }

    // ── Notify ALL wardens: payment received ───────────────
    const wardens = await User.find({ role: "warden" }).select("_id").lean();
    const sName   = payment.student?.fullName || "A student";
    const sDept   = payment.student?.department || "";

    await Promise.all(wardens.map((w) =>
      pushNotification(
        w._id,
        "PAYMENT_RECEIVED",
        "💳 Payment Received",
        `${sName} (${sDept}) paid ₹${payment.amount} for ${payment.academicYear}. ` +
        `Receipt: ${payment.receiptNumber}`,
        { model: "Payment", id: payment._id }
      )
    ));

    res.json(payment);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// WARDEN / ADMIN: View all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("student").sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};