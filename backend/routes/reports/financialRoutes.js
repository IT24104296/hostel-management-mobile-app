const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/UserAuth/auth.middleware");

const financialController = require("../../controllers/reports/financialController");

// Existing routes
router.get("/summary", auth, financialController.getFinancialSummary);
router.get("/payment-method-summary", auth, financialController.getPaymentMethodSummary);
router.get("/monthly", auth, financialController.monthlyReport);

// ✅ NEW REPORT ROUTES (FIXED)
router.post("/report", auth, financialController.createReport);
router.get("/report", auth, financialController.getReports);
router.delete("/report/:id", auth, financialController.deleteReport);

module.exports = router;