const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    type: {
      type: String,
      enum: ["admission", "monthly_rent", "adjustment"],
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
      default: null,           // null for pending reminders
    },
    amount: {
      type: Number,
      default: 0,              // 0 for pending reminders
      min: 0,
    },
    method: {
      type: String,
      enum: ["cash", "bank_transfer", "online", "other"],
      default: null,           // null for pending
    },
    referenceNo: {
      type: String,
      trim: true,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
    recordedBy: {
      type: String,
      ref: "User",
      default: null,           // null for pending (system generated)
    },
    billingPeriod: {
      type: String,
    },
    status: {
      type: String,
      enum: ["paid", "partial", "overdue", "pending"],   // ← pending is now official
      default: "paid",
    },
  },
  { timestamps: true }
);

paymentSchema.index({ student: 1, dueDate: 1 });
paymentSchema.index({ student: 1, paidDate: -1 });

module.exports = mongoose.model("Payment", paymentSchema);