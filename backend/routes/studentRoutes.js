const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.post("/", studentController.createStudent);
router.get("/", studentController.getStudents);
router.get("/search", studentController.searchStudent);
router.get("/:id", studentController.getStudentById);
router.put("/:id", studentController.updateStudent);
router.patch("/:id/inactive", studentController.markInactive);
router.delete("/:id", studentController.deleteStudent);

module.exports = router;