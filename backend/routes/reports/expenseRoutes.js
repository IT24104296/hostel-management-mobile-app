// ═══════════════════════════════════════════════════════════════════
//  backend/routes/expenseRoutes.js  —  NEW FILE
//
//  PURPOSE:
//  Defines all API routes for the expense module and maps them
//  to the correct controller functions.
//
//  BASE URL (registered in server.js):
//  app.use("/api/expenses", expenseRoutes)
//
//  FULL ROUTES:
//  POST   /api/expenses        → createExpense
//  GET    /api/expenses        → getAllExpenses
//  PUT    /api/expenses/:id    → updateExpense
//  DELETE /api/expenses/:id    → deleteExpense
// ═══════════════════════════════════════════════════════════════════

const express = require("express");
const router  = express.Router();

const expenseController = require("../../controllers/reports/expenseController");

// Create a new expense
router.post("/", expenseController.createExpense);

// Get all expenses (supports ?start= &end= &category= query params)
router.get("/", expenseController.getAllExpenses);

// Update an expense by ID
router.put("/:id", expenseController.updateExpense);

// Delete an expense by ID
router.delete("/:id", expenseController.deleteExpense);

module.exports = router;