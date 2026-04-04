const Payment = require("../models/Payment");
const Student = require("../models/Student");

const generateReceiptNo = () => {
  return "FTXN" + Date.now();
};

// GET - payment list screen
const getStudentPaymentList = async (req, res) => {
  try {
    const { search = "", status = "all" } = req.query;

    const students = await Student.find({
      roomNumber: { $regex: search, $options: "i" },
    }).sort({ roomNumber: 1 });

    const result = [];

    for (const student of students) {
      const payments = await Payment.find({ studentId: student.studentId });

      const totalPaid = payments
        .filter((item) => item.status === "completed")
        .reduce((sum, item) => sum + item.amount, 0);

      const totalDue = Math.max(student.totalFee - totalPaid, 0);

      let paymentStatus = "paid";
      if (totalDue > 0) {
        paymentStatus = "due";
      }

      if (status === "paid" && paymentStatus !== "paid") {
        continue;
      }

      if (status === "due" && paymentStatus !== "due") {
        continue;
      }

      result.push({
        studentId: student.studentId,
        studentName: student.name,
        roomNumber: student.roomNumber,
        totalPaid,
        totalDue,
        status: paymentStatus,
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - payment details screen
const getStudentPaymentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status = "all" } = req.query;

    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    let payments = await Payment.find({ studentId }).sort({ createdAt: -1 });

    if (status !== "all") {
      payments = payments.filter((item) => item.status === status);
    }

    const allPayments = await Payment.find({ studentId });

    const totalPaid = allPayments
      .filter((item) => item.status === "completed")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalDue = Math.max(student.totalFee - totalPaid, 0);

    res.json({
      student: {
        studentId: student.studentId,
        name: student.name,
        roomNumber: student.roomNumber,
        phone: student.phone,
        totalFee: student.totalFee,
      },
      summary: {
        totalPaid,
        totalDue,
      },
      payments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - new payment
const addPayment = async (req, res) => {
  try {
    const {
      studentId,
      amount,
      paymentMethod,
      paymentDate,
      phoneNumber,
      receivedBy,
      notes,
      status,
      paymentMonth,
    } = req.body;

    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const newPayment = new Payment({
      studentId: student.studentId,
      studentName: student.name,
      roomNumber: student.roomNumber,
      amount,
      paymentMethod,
      paymentDate,
      phoneNumber,
      receivedBy,
      notes,
      status,
      paymentMonth,
      receiptNo: generateReceiptNo(),
    });

    const savedPayment = await newPayment.save();

    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - receipt
const getReceiptById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const student = await Student.findOne({ studentId: payment.studentId });

    res.json({
      payment,
      student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
const deletePayment = async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentPaymentList,
  getStudentPaymentDetails,
  addPayment,
  getReceiptById,
  deletePayment,
};