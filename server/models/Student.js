const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: String,
    rollNumber: {
      type: String,
      required: true,
      unique: true

    },
    course: String,
    department: String,
    collegeName: String,

    batch: {
      type: String,
      required: true
    },

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
    address: {
  type: String,
  trim: true,
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
