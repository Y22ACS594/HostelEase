const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ADMIN → Create WARDEN
exports.createWarden = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Warden already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const warden = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "warden",
    });

    res.status(201).json({
      message: "Warden created successfully",
      warden,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN → Get all wardens
exports.getAllWardens = async (req, res) => {
  try {
    const wardens = await User.find({ role: "warden" }).select("-password");
    res.json(wardens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN → Activate / Deactivate Warden
exports.toggleWardenStatus = async (req, res) => {
  try {
    const warden = await User.findById(req.params.id);

    if (!warden || warden.role !== "warden") {
      return res.status(404).json({ message: "Warden not found" });
    }

    warden.isActive = !warden.isActive;
    await warden.save();

    res.json({
      message: "Warden status updated",
      isActive: warden.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
