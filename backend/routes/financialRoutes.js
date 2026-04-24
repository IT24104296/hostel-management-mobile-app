const express = require("express");
const router = express.Router();

const financialController = require("../controllers/financialController");

// Existing routes
router.get("/summary", financialController.getFinancialSummary);
router.get("/payment-method-summary", financialController.getPaymentMethodSummary);
router.get("/monthly", financialController.monthlyReport);

// ✅ NEW REPORT ROUTES (FIXED)
router.post("/report", financialController.createReport);
router.get("/report", financialController.getReports);
router.delete("/report/:id", financialController.deleteReport);

module.exports = router;