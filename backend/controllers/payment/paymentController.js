const Student = require("../../models/student/Student");
const Payment = require("../../models/payment/payment");
const { addOneMonth, getBillingPeriod } = require("../../utils/payment/paymentUtils");
const { createNotification } = require("../notifications/notificationController");



const validatePaymentInput = async (student, amount, paidDate) => {
  const errors = {};

  if (!amount || amount <= 0) {
    errors.amount = "Amount must be greater than 0 LKR";
  }

  if (paidDate) {
    const paymentDate = new Date(paidDate);
    const today = new Date();
    paymentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (paymentDate > today) {
      errors.paidDate = "Payment date cannot be in the future";
    }
  }

  if (student.status !== "active") {
    errors.student = "Cannot record payment for inactive student";
  }

  return errors;
};

// ====================== RECORD NEW PAYMENT (WITH NOTIFICATION) ======================
const createPayment = async (req, res) => {
  try {
    const { studentId, amount, method, referenceNo, notes, paidDate, recordedBy } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const validationErrors = await validatePaymentInput(student, amount, paidDate);
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    const existingPaymentCount = await Payment.countDocuments({ student: studentId });

    let paymentType;
    let dueDate;

    if (existingPaymentCount === 0) {
      // === 1ST RECORD = ADMISSION (KEY MONEY + FIRST MONTH RENT) ===
      paymentType = "admission";
      dueDate = new Date(student.admissionDate);
    } else {
      // === 2ND AND SUBSEQUENT RECORDS = MONTHLY RENT ===
      paymentType = "monthly_rent";
      dueDate = new Date(student.nextDueDate || student.admissionDate);
    }

    // Check if pending reminder exists
    let payment = await Payment.findOne({
      student: studentId,
      dueDate: dueDate,
      status: "pending",
    });

    if (payment) {
      payment.paidDate = paidDate ? new Date(paidDate) : new Date();
      payment.amount = amount;
      payment.method = method || "cash";
      payment.referenceNo = referenceNo;
      payment.notes = notes;
      payment.recordedBy = recordedBy?.trim() || undefined;
      payment.status = "paid";
      await payment.save();
    } else {
      payment = new Payment({
        student: studentId,
        type: paymentType,
        dueDate,
        paidDate: paidDate ? new Date(paidDate) : new Date(),
        amount,
        method: method || "cash",
        referenceNo,
        notes,
        recordedBy: recordedBy?.trim() || undefined,
        billingPeriod: getBillingPeriod(dueDate),
        status: "paid",
      });
      await payment.save();
    }

    // ====================== NEXT DUE DATE LOGIC (YOUR EXACT REQUIREMENT) ======================
    if (existingPaymentCount === 0) {
      // 1st record (admission) → DO NOT update nextDueDate
    } else if (existingPaymentCount === 1) {
      // 2nd record (first monthly rent) → set nextDueDate = admissionDate + 1 month
      student.nextDueDate = addOneMonth(student.admissionDate);
    } else {
      // 3rd record onwards → normal advancement
      student.nextDueDate = addOneMonth(dueDate);
    }
    await student.save();

    // ====================== CREATE NOTIFICATION ======================
    // Import this at the top of the file: const { createNotification } = require("./notificationController");
    await createNotification(
      req.userId,                                      // Admin who recorded the payment
      "Payment Received ✅",
      `${student.fullName} paid LKR ${amount} for ${paymentType === "admission" ? "Admission Fee" : "Monthly Rent"}`,
      "payment_received",
      student._id,
      payment._id
    );
    // =================================================================

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment,
      nextDueDate: student.nextDueDate,
    });
  } catch (error) {
    console.error("Create Payment Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// ====================== REST OF YOUR CONTROLLER (UNCHANGED) ======================
const getStudentPaymentHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const payments = await Payment.find({ student: studentId })
      .sort({ dueDate: -1, paidDate: -1 })
      

        const student = await Student.findById(studentId)
      .select("fullName admissionDate nextDueDate monthlyRent keyMoneyAmount status room studentId")
      .populate("room", "roomNumber");  

    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({ student, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentDashboard = async (req, res) => {
  try {
    const students = await Student.find({
      status: "active",
      isDeleted: false,
    })
      .populate("room", "roomNumber")
      .select("fullName room admissionDate nextDueDate monthlyRent keyMoneyAmount")
      .lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dashboardData = await Promise.all(
      students.map(async (student) => {
        const latestPayment = await Payment.findOne({ student: student._id })
          .sort({ paidDate: -1 })
          .lean();

        let paymentStatus = "pending_admission";
        let daysUntilDue = null;
        let dueDateDisplay = null;

        if (student.nextDueDate) {
          const due = new Date(student.nextDueDate);
          due.setHours(0, 0, 0, 0);

          if (due < today) paymentStatus = "overdue";
          else if (due.getTime() === today.getTime()) paymentStatus = "due_today";
          else {
            const diffTime = due - today;
            daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            paymentStatus = daysUntilDue <= 5 ? "due_soon" : "paid";
          }
          dueDateDisplay = due.toISOString().split("T")[0];
        }

        return {
          ...student,
          paymentStatus,
          daysUntilDue,
          dueDateDisplay,
          latestPaymentAmount: latestPayment ? latestPayment.amount : 0,
        };
      })
    );

    const totalActive = dashboardData.length;
    const overdueCount = dashboardData.filter((s) => s.paymentStatus === "overdue").length;
    const dueTodayCount = dashboardData.filter((s) => s.paymentStatus === "due_today").length;
    const dueSoonCount = dashboardData.filter((s) => s.paymentStatus === "due_soon").length;

    res.json({
      success: true,
      summary: { totalActive, overdueCount, dueTodayCount, dueSoonCount },
      students: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, method, referenceNo, notes, paidDate, recordedBy } = req.body;

    const payment = await Payment.findById(paymentId).populate("student");
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const student = payment.student;

    const validationErrors = await validatePaymentInput(student, amount, paidDate);
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    // ==================== FIX FOR PENDING PAYMENTS ====================
    const wasPending = payment.status === "pending";

    // Update fields
    if (amount !== undefined) payment.amount = amount;
    if (method) payment.method = method;
    if (referenceNo !== undefined) payment.referenceNo = referenceNo;
    if (notes !== undefined) payment.notes = notes;
    if (paidDate) payment.paidDate = new Date(paidDate);
    
    // Support updating recordedBy
    if (recordedBy !== undefined) {
      payment.recordedBy = recordedBy.trim() || undefined;
    }

    // If it was a pending record, mark it as paid and advance nextDueDate
    if (wasPending) {
      payment.status = "paid";
      student.nextDueDate = addOneMonth(payment.dueDate);
      await student.save();
    }
    // =================================================================

    await payment.save();

    // ====================== SEND NOTIFICATION TO ALL ADMINS ======================
    if (wasPending) {
      await createNotification(
        null,                                          // ← null = visible to ALL admins
        "Payment Received ✅",
        `${student.fullName} paid LKR ${amount} for ${payment.billingPeriod || "Monthly Rent"}`,
        "payment_received",
        student._id,
        payment._id
      );
    }
    // =================================================================================

    res.json({
      success: true,
      message: "Payment updated successfully",
      payment,
    });
  } catch (error) {
    console.error("Update Payment Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId).populate("student");
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const student = payment.student;

    await Payment.findByIdAndDelete(paymentId);

    const remainingPayments = await Payment.find({ student: student._id })
      .sort({ dueDate: -1 });

    if (remainingPayments.length === 0) {
      student.nextDueDate = null;
    } else {
      student.nextDueDate = addOneMonth(remainingPayments[0].dueDate);
    }

    await student.save();

    res.json({
      success: true,
      message: "Payment deleted successfully. Next due date recalculated.",
    });
  } catch (error) {
    console.error("Delete Payment Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const generatePendingPayments = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const students = await Student.find({
      status: "active",
      isDeleted: false,
      nextDueDate: { $lte: today },
    });

    let createdCount = 0;

    for (const student of students) {
      let currentDueDate = new Date(student.nextDueDate);

      // Create pending log for every overdue month
      while (currentDueDate <= today) {
        const existing = await Payment.findOne({
          student: student._id,
          dueDate: currentDueDate,
          status: "pending",
        });

        if (!existing) {
          const pendingLog = new Payment({
            student: student._id,
            type: "monthly_rent",
            dueDate: new Date(currentDueDate),
            paidDate: null,
            amount: student.monthlyRent,
            method: null,
            referenceNo: null,
            notes: null,
            recordedBy: null,
            billingPeriod: getBillingPeriod(currentDueDate),
            status: "pending",
          });

          await pendingLog.save();
          createdCount++;
        }

        // Move to next month
        currentDueDate = addOneMonth(currentDueDate);
      }

      // IMPORTANT: DO NOT update nextDueDate here
      // nextDueDate should remain on the oldest unpaid due date
      // so the student continues to show as "overdue" in dashboard
    }

    console.log(`✅ Auto-created ${createdCount} pending reminder logs`);
    return createdCount;
  } catch (error) {
    console.error("Generate Pending Payments Error:", error);
  }
};

module.exports = {
  createPayment,
  getStudentPaymentHistory,
  getPaymentDashboard,
  updatePayment,
  deletePayment,
  generatePendingPayments,
};