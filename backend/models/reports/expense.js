// ═══════════════════════════════════════════════════════════════════
//  backend/models/Expense.js  —  NEW FILE
//
//  PURPOSE:
//  MongoDB schema for a single hostel expense record.
//  This model stores all operational costs of the hostel such as
//  electricity bills, water bills, staff salaries etc.
//
//  FIELDS:
//  title       — short name of the expense (e.g. "March Electricity")
//  category    — dropdown category so reports can group by type
//  amount      — expense amount in Rs
//  date        — when the expense occurred (defaults to today)
//  description — optional extra notes (e.g. "increased due to AC usage")
//
//  USED BY:
//  expenseController.js  — CRUD operations
//  financialController.js — createReport() sums expenses for date range
// ═══════════════════════════════════════════════════════════════════

const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,   // must have a name
    trim: true,       // removes accidental spaces
  },

  category: {
    type: String,
    required: true,
    // fixed list so reports can group by category consistently
    enum: [
      "Electricity",
      "Water",
      "Internet",
      "Maintenance",
      "Cleaning",
      "Staff Salary",
      "Other",
    ],
  },

  amount: {
    type: Number,
    required: true,
    min: 0,           // expense cannot be negative
  },

  date: {
    type: Date,
    default: Date.now, // defaults to today if not provided
  },

  description: {
    type: String,
    trim: true,
    default: "",       // optional — empty string if not provided
  },

}, {
  // createdAt and updatedAt added automatically by mongoose
  timestamps: true,
});

module.exports = mongoose.model("Expense", expenseSchema);