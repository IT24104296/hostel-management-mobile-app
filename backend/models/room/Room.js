const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true, trim: true },
    floor: { type: Number, required: true },
    capacity: { type: Number, required: true, min: 1 },

    // For now store student IDs as strings (you can change to ObjectId later)
    assignedStudents: { type: [String], default: [] },

    status: {
      type: String,
      enum: ["Available", "Partially Occupied", "Occupied"],
      default: "Available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);