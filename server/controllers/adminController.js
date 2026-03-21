// controllers/adminController.js — Full warden CRUD
const User   = require("../models/User");
const bcrypt = require("bcryptjs");
const pushNotification = require("../utils/notificationHelper");

/* ── CREATE WARDEN ──────────────────────────────────────── */
exports.createWarden = async (req, res) => {
  try {
    const { name, email, password, phone, address, department, employeeId } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "A warden with this email already exists" });

    const hashed = await bcrypt.hash(password, 12);

    const warden = await User.create({
      name, email, password: hashed, role: "warden",
      phone: phone || "", address: address || "",
      department: department || "", employeeId: employeeId || "",
      isActive: true,
    });

    // Welcome notification to warden
    await pushNotification(
      warden._id, "GENERAL",
      "🎉 Welcome to HostelEase!",
      `Hello ${name}! Your warden account has been created by the admin. You can now log in and manage hostel operations.`,
      {}
    );

    res.status(201).json({
      message: "Warden created successfully",
      warden: { _id:warden._id, name, email, phone, address, department, employeeId, isActive:true, createdAt:warden.createdAt },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ── GET ALL WARDENS ─────────────────────────────────────── */
exports.getAllWardens = async (req, res) => {
  try {
    const wardens = await User.find({ role: "warden" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(wardens);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ── GET SINGLE WARDEN ───────────────────────────────────── */
exports.getWarden = async (req, res) => {
  try {
    const warden = await User.findOne({ _id: req.params.id, role: "warden" }).select("-password");
    if (!warden) return res.status(404).json({ message: "Warden not found" });
    res.json(warden);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ── UPDATE WARDEN ───────────────────────────────────────── */
exports.updateWarden = async (req, res) => {
  try {
    const { name, email, phone, address, department, employeeId, password } = req.body;
    const warden = await User.findOne({ _id: req.params.id, role: "warden" });
    if (!warden) return res.status(404).json({ message: "Warden not found" });

    if (name)       warden.name       = name;
    if (email)      warden.email      = email;
    if (phone)      warden.phone      = phone;
    if (address)    warden.address    = address;
    if (department) warden.department = department;
    if (employeeId) warden.employeeId = employeeId;
    if (password && password.trim().length >= 6) {
      warden.password = await bcrypt.hash(password, 12);
    }

    await warden.save();
    res.json({ message: "Warden updated successfully", warden });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ── TOGGLE STATUS ───────────────────────────────────────── */
exports.toggleWardenStatus = async (req, res) => {
  try {
    const warden = await User.findOne({ _id: req.params.id, role: "warden" });
    if (!warden) return res.status(404).json({ message: "Warden not found" });
    warden.isActive = !warden.isActive;
    await warden.save();
    res.json({ message: `Warden ${warden.isActive ? "activated" : "deactivated"}`, isActive: warden.isActive });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ── DELETE WARDEN ───────────────────────────────────────── */
exports.deleteWarden = async (req, res) => {
  try {
    const warden = await User.findOneAndDelete({ _id: req.params.id, role: "warden" });
    if (!warden) return res.status(404).json({ message: "Warden not found" });
    res.json({ message: "Warden deleted successfully" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};