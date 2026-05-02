const express = require("express");
const router = express.Router();

const {
  addComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
} = require("../../controllers/complaint/ComplaintController");

// Import your existing auth middleware (same as Contract, Payment, etc.)
const auth = require("../../middlewares/UserAuth/auth.middleware");

// ====================== ALL ROUTES ARE PROTECTED ======================
router.post("/", auth, addComplaint);           // Create new complaint
router.get("/", auth, getComplaints);           // Get all complaints (supports ?status=Pending&priority=High)
router.get("/:id", auth, getComplaintById);     // Get single complaint by ID
router.put("/:id", auth, updateComplaint);      // Update complaint
router.delete("/:id", auth, deleteComplaint);   // Delete complaint

module.exports = router;