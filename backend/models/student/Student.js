const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    nic: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    parentName: {
      type: String,
      required: true,
      trim: true,
    },
    parentPhone: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    university: {
      type: String,
      required: false,
      trim: true,
    },

    
    monthlyRent: {
      type: Number,
      required: true,
      min: 0,
    },
    keyMoneyAmount: {
      type: Number,
      required: true,          
      min: 0,
    },
    nextDueDate: {
      type: Date,
      required: false,         
    },
    

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    admissionDate: {
      type: Date,
      required: true,
    },
    leavingDate: {
      type: Date,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default: '',
      required: false
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);