// ═══════════════════════════════════════════════════════════════════
//  backend/controllers/financialController.js  —  UPDATED
//
//  CHANGE FROM PREVIOUS VERSION:
//  Only createReport() is updated. All other functions are unchanged.
//
//  WHAT CHANGED IN createReport():
//  After calculating income totals, it now also:
//    1. Queries the Expense collection for the same date range
//    2. Sums all expense amounts into totalExpenses
//    3. Calculates netBalance = totalIncome - totalExpenses
//    4. Saves both new fields into the FinancialReport document
// ═══════════════════════════════════════════════════════════════════

const Payment       = require("../../models/payment/payment");
const FinancialReport = require("../../models/reports/FinancialReport");
const Expense       = require("../../models/reports/expense"); // ✅ NEW import

const buildDateRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Include the full end day (23:59:59.999) so same-day data is not dropped.
  endDate.setHours(23, 59, 59, 999);

  return { $gte: startDate, $lte: endDate };
};

const buildPaymentDateQuery = (start, end) => {
  const range = buildDateRange(start, end);
  return {
    $or: [
           // Atlas data schema
      { createdAt: range },   // fallback
    ],
  };
};

const normalizeMethod = (payment) => {
  const raw = payment.paymentMethod || payment.method || "";
  const value = String(raw).trim().toLowerCase();

  if (value === "cash") return "Cash";
  if (value === "bank transfer" || value === "bank") return "Bank Transfer";
  if (value === "key money" || value === "keymoney") return "Key Money";
  return "";
};

/* ═══════════════════════════════════════════════════════════════════
   Financial Summary (with date filter) — UNCHANGED
═══════════════════════════════════════════════════════════════════ */
exports.getFinancialSummary = async (req, res) => {
  try {
    const { start, end } = req.query;

    let filter = {};

    if (start && end) {
      filter = buildPaymentDateQuery(start, end);
    }

    const payments = await Payment.find(filter);

    const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);

    const collected = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);

    const pending = payments
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({ totalIncome, collected, pending });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ═══════════════════════════════════════════════════════════════════
   Payment Method Summary — UNCHANGED
═══════════════════════════════════════════════════════════════════ */
exports.getPaymentMethodSummary = async (req, res) => {
  try {
    const payments = await Payment.find();

    const cash = payments
      .filter(p => normalizeMethod(p) === "Cash")
      .reduce((sum, p) => sum + p.amount, 0);

    const bank = payments
      .filter(p => normalizeMethod(p) === "Bank Transfer")
      .reduce((sum, p) => sum + p.amount, 0);

    const keyMoney = payments
      .filter(p => normalizeMethod(p) === "Key Money")
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({ cash, bank, keyMoney });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ═══════════════════════════════════════════════════════════════════
   Monthly Earnings Report — UNCHANGED
═══════════════════════════════════════════════════════════════════ */
exports.monthlyReport = async (req, res) => {
  try {
    const data = await Payment.aggregate([
      {
        $addFields: {
          eventDate: { $ifNull: ["$paymentDate", { $ifNull: ["$paidDate", { $ifNull: ["$dueDate", "$createdAt"] }] }] },
        },
      },
      {
        $match: {
          eventDate: { $type: "date" },
        },
      },
      {
        $group: {
          _id: { $month: "$eventDate" },
          total: { $sum: "$amount" },
        },
      },
      {
        $match: {
          _id: { $ne: null },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ═══════════════════════════════════════════════════════════════════
   CREATE REPORT  —  UPDATED
   POST /api/financial/report
   Body: { start, end }

   WHAT'S NEW:
   After calculating all the income/payment figures (unchanged),
   it now also queries Expense collection for the same date range,
   totals them up, and saves totalExpenses + netBalance to the report.
═══════════════════════════════════════════════════════════════════ */
exports.createReport = async (req, res) => {
  try {
    const { start, end } = req.body;

    const dateFilter = buildDateRange(start, end);

    // ── Income calculations (unchanged) ──────────────────────────
    const payments = await Payment.find(buildPaymentDateQuery(start, end));

    const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);

    const collected = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);

    const pending = payments
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);

    const cash = payments
      .filter(p => normalizeMethod(p) === "Cash")
      .reduce((sum, p) => sum + p.amount, 0);

    const bank = payments
      .filter(p => normalizeMethod(p) === "Bank Transfer")
      .reduce((sum, p) => sum + p.amount, 0);

    const keyMoney = payments
      .filter(p => normalizeMethod(p) === "Key Money")
      .reduce((sum, p) => sum + p.amount, 0);

    // ✅ NEW: Expense calculations ────────────────────────────────
    // Query all expenses that fall within the same date range
    const expenses = await Expense.find({ date: dateFilter });

    // Sum all expense amounts
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Net balance: positive = profit, negative = loss
    const netBalance = totalIncome - totalExpenses;

    // ── Save report with all fields ───────────────────────────────
    const report = new FinancialReport({
      startDate: start,
      endDate:   end,
      totalIncome,
      collected,
      pending,
      cash,
      bank,
      keyMoney,
      totalExpenses,  // ✅ NEW
      netBalance,     // ✅ NEW
    });

    await report.save();

    res.json(report);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ═══════════════════════════════════════════════════════════════════
   GET ALL REPORTS — UNCHANGED
═══════════════════════════════════════════════════════════════════ */
exports.getReports = async (req, res) => {
  try {
    const reports = await FinancialReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ═══════════════════════════════════════════════════════════════════
   DELETE REPORT — UNCHANGED
═══════════════════════════════════════════════════════════════════ */
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    await FinancialReport.findByIdAndDelete(id);
    res.json({ message: "Report deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};