const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  nic: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  parentName: {
    type: String,
    required: true
  },
  parentPhone: {
    type: String,
    required: true
  },
  whatsapp: {
    type: String
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: false
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  leavingDate: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);