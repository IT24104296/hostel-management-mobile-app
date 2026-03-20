
const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '1.0.0.1']);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();



const app = express();
const authRoutes = require("./routes/UserAuth/auth.routes");

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Error:", err));


app.get("/", (req, res) => {
  res.send("Hostel Management Backend Running");
});
app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const studentRoutes = require("./routes/student/studentRoutes");
app.use("/api/students", studentRoutes);