const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/student/studentRoutes");
const authRoutes = require("./routes/UserAuth/auth.routes");
const roomRoutes = require("./routes/room/roomRoutes");
const paymentRoutes = require("./routes/payment/paymentRoutes");
const contractRoutes = require("./routes/contract/contractRoutes");
const notificationRoutes = require("./routes/notifications/notificationsRoutes");
const financialRoutes = require("./routes/reports/financialRoutes");
const expenseRoutes = require("./routes/reports/expenseRoutes");
const complaintRoutes = require("./routes/complaint/ComplaintRoutes");

const cron = require("node-cron");


const { generatePendingPayments } = require("./controllers/payment/paymentController");
const { generateDueNotifications } = require("./controllers/notifications/notificationController");   // ← NEW

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hostel Management Backend Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/financial", financialRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/complaints", complaintRoutes);




cron.schedule("30 06 * * *", async () => {
  console.log(" Running daily pending payment check...");
  await generatePendingPayments();
});


cron.schedule("30 06 * * *", async () => {
  console.log(" Running daily due/overdue notification job...");
  await generateDueNotifications();
}, {
  timezone: "Asia/Colombo"   
});

console.log(" Cron jobs scheduled successfully");

module.exports = app;