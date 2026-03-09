const Room = require("../models/Room");

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

// GET /api/rooms?status=Available
exports.getRooms = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const rooms = await Room.find(query).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/rooms/:id
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
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

// DELETE /api/rooms/:id
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    await room.deleteOne();
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/rooms/:id/assign
exports.assignStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: "studentId is required" });

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.assignedStudents.includes(studentId)) {
      return res.status(409).json({ message: "Student already assigned to this room" });
    }

    if (room.assignedStudents.length >= room.capacity) {
      return res.status(400).json({ message: "Room is fully occupied" });
    }

    room.assignedStudents.push(studentId);
    room.status = calcStatus(room.capacity, room.assignedStudents.length);

    const updated = await room.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/rooms/:id/remove
exports.removeStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: "studentId is required" });

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const before = room.assignedStudents.length;
    room.assignedStudents = room.assignedStudents.filter((id) => id !== studentId);

    if (room.assignedStudents.length === before) {
      return res.status(404).json({ message: "Student not found in this room" });
    }

    room.status = calcStatus(room.capacity, room.assignedStudents.length);

    const updated = await room.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/rooms/summary
exports.roomsSummary = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: "Occupied" });
    const availableRooms = await Room.countDocuments({ status: "Available" });
    const partiallyOccupiedRooms = await Room.countDocuments({ status: "Partially Occupied" });

    res.json({ totalRooms, occupiedRooms, availableRooms, partiallyOccupiedRooms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};