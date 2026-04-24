// ═══════════════════════════════════════════════════════════════════
//  backend/server.js  —  UPDATED
//
//  CHANGE FROM PREVIOUS VERSION:
//  Added expenseRoutes import and registration.
//  Two new lines marked with ✅ NEW below.
//  Everything else is identical to the corrected version.
// ═══════════════════════════════════════════════════════════════════

const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '1.0.0.1']);

const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ── MongoDB Connection ────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// ── Test Route ────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Hostel Management Backend Running");
});

// ── Routes — all registered BEFORE app.listen() ──────────────────
const financialRoutes = require("./routes/financialRoutes");
app.use("/api/financial", financialRoutes);

// ✅ NEW: Expense routes registered here
const expenseRoutes = require("./routes/expenseRoutes");
app.use("/api/expenses", expenseRoutes);

// ── Start Server ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});