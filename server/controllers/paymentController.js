const Payment = require("../models/Payment");
const Student = require("../models/Student");

// STUDENT: View own payments
exports.getMyPayments = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const payments = await Payment.find({ student: student._id });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// STUDENT: Initiate payment
exports.initiatePayment = async (req, res) => {
  try {
    const { amount, academicYear, paymentMode } = req.body;

    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const payment = await Payment.create({
      student: student._id,
      amount,
      academicYear,
      paymentMode,
      paymentStatus: "Pending",
    });

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// STUDENT: Confirm payment (simulate success)
exports.confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.paymentStatus = "Paid";
    payment.receiptNumber = `HE-${Date.now()}`;
    payment.paidDate = new Date();

    await payment.save();
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// WARDEN / ADMIN: View all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("student");
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
