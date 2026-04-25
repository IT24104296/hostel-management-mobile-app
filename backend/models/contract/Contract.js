const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema({

  studentName: {
    type: String,
    required: true
  },

  studentId: {
    type: String,
    required: true
  },

  contactNumber: {
    type: String,
    required: true
  },

  roomNumber: {
    type: String,
    required: true
  },

  moveInDate: {
    type: Date,
    required: true
  },

  durationMonths: {
    type: Number,
    required: true,
    min: 1
  },

  endDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    default: "Active"
  }

});

module.exports = mongoose.model("Contract", contractSchema);