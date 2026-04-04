const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMonth: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "bank transfer", "pending"],
    },
    paymentDate: {
      type: String,
      required: true,
    },
        phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^[0-9]{10}$/.test(value);
        },
        message: "Phone number must contain exactly 10 digits",
      },
    },
    receivedBy: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      required: true,
      enum: ["completed", "pending"],
      default: "completed",
    },
    receiptNo: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);