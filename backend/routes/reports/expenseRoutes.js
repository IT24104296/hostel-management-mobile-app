const auth = require("../../middlewares/UserAuth/auth.middleware");

const express = require("express");
const router  = express.Router();

const expenseController = require("../../controllers/reports/expenseController");

// Create a new expense
router.post("/", auth, expenseController.createExpense);

// Get all expenses (supports ?start= &end= &category= query params)
router.get("/", auth, expenseController.getAllExpenses);

// Update an expense by ID
router.put("/:id", auth, expenseController.updateExpense);

// Delete an expense by ID
router.delete("/:id", auth, expenseController.deleteExpense);

module.exports = router;