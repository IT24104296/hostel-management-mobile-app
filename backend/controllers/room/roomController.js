const Room = require("../../models/room/Room");
const Student = require("../../models/student/Student");   // ←←← ADD THIS LINE

const calcStatus = (capacity, count) => {
  if (count === 0) return "Available";
  if (count >= capacity) return "Occupied";
  return "Partially Occupied";
};

// POST /api/rooms
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, floor, capacity } = req.body;

    if (!roomNumber || floor === undefined || capacity === undefined) {
      return res.status(400).json({ message: "roomNumber, floor, capacity are required" });
    }

    const exists = await Room.findOne({ roomNumber: roomNumber.trim() });
    if (exists) return res.status(409).json({ message: "Room number already exists" });

    const room = await Room.create({
      roomNumber: roomNumber.trim(),
      floor: Number(floor),
      capacity: Number(capacity),
      assignedStudents: [],
      status: "Available",
    });

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/rooms
exports.getRooms = async (req, res) => {
  try {
    console.log("✅ getRooms called - trying to fetch rooms...");

    const rooms = await Room.find({})
      .populate("assignedStudents", "fullName")
      .sort({ roomNumber: 1 });        // ← Changed this

    console.log(`✅ Successfully fetched ${rooms.length} rooms`);
    res.json(rooms);
  } catch (err) {
    console.error("❌ getRooms CRASHED:", err.message);
    res.status(500).json({ message: "Server error in getRooms", error: err.message });
  }
};

// GET /api/rooms/:id
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("assignedStudents", "fullName");   // ← Corrected populate

    if (!room) return res.status(404).json({ message: "Room not found" });

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// PUT /api/rooms/:id
exports.updateRoom = async (req, res) => {
  try {
    const { roomNumber, floor, capacity } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (roomNumber && roomNumber.trim() !== room.roomNumber) {
      const exists = await Room.findOne({ roomNumber: roomNumber.trim() });
      if (exists) return res.status(409).json({ message: "Room number already exists" });
      room.roomNumber = roomNumber.trim();
    }

    if (floor !== undefined) room.floor = Number(floor);
    if (capacity !== undefined) room.capacity = Number(capacity);

    room.status = calcStatus(room.capacity, room.assignedStudents.length);

    const updated = await room.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // 🔥 NEW CHECK - Prevent deletion if students are assigned
    if (room.assignedStudents && room.assignedStudents.length > 0) {
      return res.status(400).json({
        message: "Cannot delete room with assigned students. Please remove all students first.",
      });
    }

    // If we reach here, the room is empty → safe to delete
    await Room.findByIdAndDelete(id);

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Delete room error:", error);
    res.status(500).json({ message: error.message });
  }
};





// GET /api/rooms/summary
exports.roomsSummary = async (req, res) => {
  try {
    const rooms = await Room.find({})
      .populate("assignedStudents", "fullName");

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === "Occupied").length;
    const availableRooms = rooms.filter(r => r.status === "Available").length;
    const partiallyOccupiedRooms = rooms.filter(r => r.status === "Partially Occupied").length;

    console.log(`✅ Summary calculated: Total=${totalRooms}`);
    res.json({
      totalRooms,
      occupiedRooms,
      availableRooms,
      partiallyOccupiedRooms
    });
  } catch (err) {
    console.error("❌ roomsSummary ERROR:", err.message);
    console.error(err.stack);
    res.status(500).json({ message: "Failed to load summary", error: err.message });
  }
};
// controllers/roomController.js

exports.assignStudent = async (req, res) => {
  const { roomId, studentId } = req.body;

  try {
    const room = await Room.findById(roomId);
    const student = await Student.findById(studentId);

    if (!room) return res.status(404).json({ message: "Room not found" });
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (student.isDeleted) return res.status(400).json({ message: "Cannot assign a deleted student" });

    // 🔥 NEW CHECK: Prevent assigning same student to multiple rooms
    if (student.room && student.room.toString() !== roomId) {
      return res.status(400).json({
        message: `Student ${student.fullName} is already assigned to another room. Please remove them from the current room first.`,
      });
    }

    // Room full check
    if (room.assignedStudents.length >= room.capacity) {
      return res.status(400).json({ message: "Room is already at full capacity" });
    }

    // Prevent duplicate assignment to the same room
    if (room.assignedStudents.includes(studentId)) {
      return res.status(400).json({ message: "Student is already assigned to this room" });
    }

    // Assign student (both sides)
    room.assignedStudents.push(studentId);
    student.room = roomId;

    await room.save();
    await student.save();

    // Return updated room with populated students
    const updatedRoom = await Room.findById(roomId).populate("assignedStudents", "fullName");

    res.json(updatedRoom);
  } catch (error) {
    console.error("Assign student error:", error);
    res.status(500).json({ message: error.message });
  }
};
exports.removeStudent = async (req, res) => {
  const { roomId, studentId } = req.body;

  try {
    const room = await Room.findById(roomId);
    const student = await Student.findById(studentId);

    if (!room) return res.status(404).json({ message: "Room not found" });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Remove from room
    await Room.updateOne(
      { _id: roomId },
      { $pull: { assignedStudents: studentId } }
    );

    // Clear student's room reference
    if (student.room && student.room.toString() === roomId) {
      student.room = null;
      await student.save();
    }

    const updatedRoom = await Room.findById(roomId).populate("assignedStudents", "fullName");
    res.json(updatedRoom);
  } catch (error) {
    console.error("Remove student error:", error);
    res.status(500).json({ message: error.message });
  }
};