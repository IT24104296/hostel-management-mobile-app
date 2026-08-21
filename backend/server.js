const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const mongoose = require("mongoose");
require("dotenv").config();

const app = require("./app");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Atlas Connection Error:", err));

const PORT = process.env.PORT || 5000;

// FIXED for Android emulator
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`   ✅ Emulator should use: http://10.0.2.2:${PORT}`);
});