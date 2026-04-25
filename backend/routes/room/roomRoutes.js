const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/UserAuth/auth.middleware");
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
router.get("/summary",auth, roomsSummary);

// CRUD
router.post("/", auth, createRoom);
router.get("/", auth, getRooms);
router.get("/:id", auth, getRoomById);
router.put("/:id", auth, updateRoom);
router.delete("/:id", auth, deleteRoom);

// assign/remove
router.post("/assign-student", auth, assignStudent);
router.post("/remove-student", auth, removeStudent);

module.exports = router;