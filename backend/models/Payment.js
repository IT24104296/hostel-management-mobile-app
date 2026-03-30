const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  paymentMonth: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },  
  paymentMethod: {
    type: String,
    default: "cash"
  },
  status: {
    type: String,
    default: "paid"
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Payment", paymentSchema);