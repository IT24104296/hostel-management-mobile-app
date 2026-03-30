const express = require("express");
const router = express.Router();

const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  assignStudent,
  removeStudent,
  roomsSummary,
} = require("../../controllers/room/roomController");

// summary first (so it doesn't get caught by "/:id")
router.get("/summary", roomsSummary);

// CRUD
router.post("/", createRoom);
router.get("/", getRooms);
router.get("/:id", getRoomById);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);

// assign/remove
router.post("/:id/assign", assignStudent);
router.post("/:id/remove", removeStudent);

module.exports = router;