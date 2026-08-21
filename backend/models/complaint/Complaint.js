const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
  },

  category: {
    type: String,
    required: true,
    enum: [
      "Plumbing",
      "Electrical",
      "Cleaning",
      "Furniture",
      "WiFi",
      "Painting",
      "Pest Control",
      "Others"
    ],
  },

  // Location & Person (just plain text inputs - no references)
  roomNumber: {
    type: String,
    required: true,
    trim: true,
  },

  studentName: {
    type: String,
    required: false,
    trim: true,
  },

  // Description
  description: {
    type: String,
    required: true,
  },

  // Priority & Status
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium",
  },

  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending",
  },

  // Admin notes / resolution details
  notes: {
    type: String,
    default: "",
  },

  // When it was resolved (automatically set when status becomes "Resolved")
  resolvedDate: {
    type: Date,
    default: null,
  },

}, { 
  timestamps: true   // automatically adds createdAt & updatedAt
});

module.exports = mongoose.model("Complaint", complaintSchema);