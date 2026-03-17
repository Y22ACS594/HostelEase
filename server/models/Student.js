// models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // ── Profile photo (base64 data-URL or external URL) ──
    avatar:        { type: String, default: "" },

    fullName:      { type: String, required: true, trim: true },
    rollNumber:    { type: String, required: true, unique: true, trim: true, uppercase: true },
    course:        { type: String, trim: true },
    department:    { type: String, trim: true, index: true },
    collegeName:   { type: String, trim: true },
    batch:         { type: String, required: true, index: true },
    gender:        { type: String, enum: ["Male", "Female", "Other"] },
    dateOfBirth:   Date,
    bloodGroup:    String,
    phoneNumber:   { type: String, unique: true, sparse: true, trim: true },
    aadhaarNumber: { type: String, sparse: true, trim: true },
    fatherName:    String,
    motherName:    String,
    parentContact: String,
    medicalIssues: { type: String, default: "None" },
    address:       { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);