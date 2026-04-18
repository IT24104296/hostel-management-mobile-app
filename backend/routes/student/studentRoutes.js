const express = require("express");
const router = express.Router();
const studentController = require("../../controllers/student/studentController");

const auth = require("../../middlewares/UserAuth/auth.middleware");

router.post("/", auth, studentController.createStudent);
router.get("/", auth,studentController.getStudents);
router.get("/search", auth, studentController.searchStudent);
router.get("/:id", auth, studentController.getStudentById);
router.put("/:id", auth, studentController.updateStudent);
router.patch("/:id/inactive", auth, studentController.deactivateStudent);
router.delete("/:id", auth, studentController.deleteStudentPermanently);

module.exports = router;