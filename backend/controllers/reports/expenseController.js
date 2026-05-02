// ═══════════════════════════════════════════════════════════════════
//  backend/controllers/expenseController.js  —  NEW FILE
//
//  PURPOSE:
//  Full CRUD controller for hostel expenses.
//  Handles: Create, Read, Update, Delete operations on Expense model.
//
//  FUNCTIONS:
//  1. createExpense   — POST   /api/expenses
//  2. getAllExpenses   — GET    /api/expenses
//  3. updateExpense   — PUT    /api/expenses/:id
//  4. deleteExpense   — DELETE /api/expenses/:id
//
//  USED BY:
//  expenseRoutes.js — each route calls one function here
// ═══════════════════════════════════════════════════════════════════

const Expense = require("../../models/reports/expense");

const buildDateRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);
  return { $gte: startDate, $lte: endDate };
};

/* ═══════════════════════════════════════════════════════════════════
   1. CREATE EXPENSE
   POST /api/expenses
   Body: { title, category, amount, date, description }

   Takes the fields from request body and saves a new Expense
   document to MongoDB. Returns the saved document.
═══════════════════════════════════════════════════════════════════ */
exports.createExpense = async (req, res) => {
  try {
    const { title, category, amount, date, description } = req.body;

    // Basic validation — title, category, amount are required
    if (!title || !category || !amount) {
      return res.status(400).json({
        error: "Title, category, and amount are required.",
      });
    }

    const expense = new Expense({
      title,
      category,
      amount,
      date: date || Date.now(),   // use provided date or default to now
      description: description || "",
    });

    await expense.save();

    res.status(201).json(expense);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ═══════════════════════════════════════════════════════════════════
   2. GET ALL EXPENSES
   GET /api/expenses
   Optional query params: ?start=YYYY-MM-DD&end=YYYY-MM-DD
                          ?category=Electricity

   Returns all expenses sorted by date descending (newest first).
   Supports optional date range filter and category filter so the
   mobile app can filter the list without loading everything.
═══════════════════════════════════════════════════════════════════ */
exports.getAllExpenses = async (req, res) => {
  try {
    const { start, end, category } = req.query;

    let filter = {};

    // Date range filter — if both start and end provided
    if (start && end) {
      filter.date = buildDateRange(start, end);
    }

    // Category filter — if provided
    if (category) {
      filter.category = category;
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    // Also return a total sum so the mobile app can show it
    // without calculating on the frontend
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      expenses,
      totalAmount,
      count: expenses.length,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ═══════════════════════════════════════════════════════════════════
   3. UPDATE EXPENSE
   PUT /api/expenses/:id
   Body: { title, category, amount, date, description }

   Finds the expense by MongoDB _id and updates all provided fields.
   { new: true } returns the updated document instead of the old one.
   { runValidators: true } ensures enum and min checks still apply.
═══════════════════════════════════════════════════════════════════ */
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, amount, date, description } = req.body;

    const updated = await Expense.findByIdAndUpdate(
      id,
      { title, category, amount, date, description },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Expense not found." });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ═══════════════════════════════════════════════════════════════════
   4. DELETE EXPENSE
   DELETE /api/expenses/:id

   Finds the expense by MongoDB _id and permanently removes it.
   Returns a success message on deletion.
═══════════════════════════════════════════════════════════════════ */
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Expense.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Expense not found." });
    }

    res.json({ message: "Expense deleted successfully." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};