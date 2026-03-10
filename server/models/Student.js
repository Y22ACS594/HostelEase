// models/Student.js  — updated for Req 1 (unique indexes)
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,    // one student per user account
    },
    fullName:     { type: String, required: true, trim: true },
    rollNumber:   { type: String, required: true, unique: true, trim: true, uppercase: true },
    course:       { type: String, trim: true },
    department:   { type: String, trim: true, index: true },
    collegeName:  { type: String, trim: true },
    batch:        { type: String, required: true, index: true },
    gender:       { type: String, enum: ["Male", "Female", "Other"] },
    dateOfBirth:  Date,
    bloodGroup:   String,
    // Unique phone — also checked before creating user (Req 1)
    phoneNumber:  { type: String, unique: true, sparse: true, trim: true },
    aadhaarNumber:{ type: String, sparse: true, trim: true },
    fatherName:   String,
    motherName:   String,
    parentContact:String,
    medicalIssues:{ type: String, default: "None" },
    address:      { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
