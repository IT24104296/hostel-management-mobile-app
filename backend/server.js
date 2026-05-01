// server.js
const express = require("express");
const cors = require("cors");
<<<<<<< HEAD
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
=======
const mongoose = require("mongoose");
require("dotenv").config();
>>>>>>> origin/develop

const roomRoutes = require("./routes/room/roomRoutes"); // ✅ add this

const app = express();

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
connectDB();

=======
// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// ✅ connect routes
app.use("/api/rooms", roomRoutes); // ✅ add this

// Test Route
>>>>>>> origin/develop
app.get("/", (req, res) => {
  res.send("Server is running");
});

const paymentRoutes = require("./routes/paymentRoutes");
const studentRoutes = require("./routes/studentRoutes");
const reminderRoutes = require("./routes/reminderRoutes");

app.use("/api/payments", paymentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/reminders", reminderRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});