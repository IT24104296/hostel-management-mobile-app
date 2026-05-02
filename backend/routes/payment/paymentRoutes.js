const express = require("express");
const router = express.Router();
const { createPayment, getStudentPaymentHistory, getPaymentDashboard, updatePayment,
  deletePayment} = require("../../controllers/payment/paymentController");

const auth = require("../../middlewares/UserAuth/auth.middleware"); 

router.post("/record", auth, createPayment);
router.get("/:studentId/history", auth, getStudentPaymentHistory);
router.get("/dashboard", auth, getPaymentDashboard);
router.put("/:paymentId", auth, updatePayment);     
router.delete("/:paymentId", auth, deletePayment);


module.exports = router;