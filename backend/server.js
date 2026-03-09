const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const roomRoutes = require("./routes/roomRoutes"); // ✅ add this

const app = express();

app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// ✅ connect routes
app.use("/api/rooms", roomRoutes); // ✅ add this

// Test Route
app.get("/", (req, res) => {
  res.send("Hostel Management Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});