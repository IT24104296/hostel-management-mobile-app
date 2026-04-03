const express = require("express");
const router = express.Router();

const {
  getStudentPaymentList,
  getStudentPaymentDetails,
  addPayment,
  getReceiptById,
  deletePayment,
} = require("../controllers/paymentController");

router.get("/students", getStudentPaymentList);
router.get("/student/:studentId", getStudentPaymentDetails);
router.post("/", addPayment);
router.get("/receipt/:id", getReceiptById);
router.delete("/:id", deletePayment);

module.exports = router;