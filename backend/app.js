const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/student/studentRoutes");
const authRoutes = require("./routes/UserAuth/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hostel Management Backend Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

module.exports = app;