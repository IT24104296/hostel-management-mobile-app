const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '1.0.0.1']);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const contractRoutes = require("./routes/contractRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

  // Contract Routes
app.use("/api/contracts", contractRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Hostel Management Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});