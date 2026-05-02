const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true, trim: true },
    floor: { type: Number, required: true },
    capacity: { type: Number, required: true, min: 1 },

    assignedStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    }],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ✅ FIXED Virtual (safe version)
roomSchema.virtual("status").get(function () {
  const assigned = this.assignedStudents || [];   // ← safety check
  const count = assigned.length;

  if (count === 0) return "Available";
  if (count >= this.capacity) return "Occupied";
  return "Partially Occupied";
});

module.exports = mongoose.model("Room", roomSchema);