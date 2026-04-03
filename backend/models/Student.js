const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    totalFee: {
      type: Number,
      required: true,
      default: 15000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);