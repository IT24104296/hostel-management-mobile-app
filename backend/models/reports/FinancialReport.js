// ═══════════════════════════════════════════════════════════════════
//  backend/models/FinancialReport.js  —  UPDATED
//
//  CHANGES FROM PREVIOUS VERSION:
//  Added two new fields:
//    totalExpenses — sum of all expenses in the report date range
//    netBalance    — totalIncome minus totalExpenses
//                    positive = profit, negative = loss
//
//  All existing fields are unchanged.
// ═══════════════════════════════════════════════════════════════════

const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({

  // ── Date range this report covers ──────────────────────────────
  startDate: Date,
  endDate:   Date,

  // ── Income fields (existing — unchanged) ───────────────────────
  totalIncome: Number,   // total of all payments (paid + pending)
  collected:   Number,   // payments with status = "paid"
  pending:     Number,   // payments with status = "pending"

  // ── Payment method breakdown (existing — unchanged) ────────────
  cash:     Number,
  bank:     Number,
  keyMoney: Number,

  // ✅ NEW: Expense fields
  totalExpenses: {
    type: Number,
    default: 0,   // default 0 so old reports without expenses still work
  },

  // ✅ NEW: Net balance = totalIncome - totalExpenses
  // Positive = hostel made a profit in this period
  // Negative = hostel spent more than it earned
  netBalance: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model("FinancialReport", reportSchema);