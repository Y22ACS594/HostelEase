const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: String,
    rollNumber: String,
    course: String,
    department: String,
    year: String,
    collegeName: String,

    gender: String,
    dateOfBirth: Date,
    bloodGroup: String,

    phoneNumber: String,
    aadhaarNumber: String,

    fatherName: String,
    motherName: String,
    parentContact: String,

    medicalIssues: {
      type: String,
      default: "None",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
