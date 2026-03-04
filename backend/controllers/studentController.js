const Student = require("../models/Student");

/* 🔹 Generate Student ID */
const generateStudentId = async () => {
  const count = await Student.countDocuments();
  return `STU${(count + 1).toString().padStart(3, "0")}`;
};

/* 🔹 Register Student */
exports.createStudent = async (req, res) => {
  try {
    const studentId = await generateStudentId();

    const student = new Student({
      ...req.body,
      studentId
    });

    await student.save();
    res.status(201).json(student);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* 🔹 Get All Active Students */
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({ isDeleted: false });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 🔹 Get Single Student Profile */
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 🔹 Update Student */
exports.updateStudent = async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* 🔹 Mark Student Inactive */
exports.markInactive = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        status: "inactive",
        leavingDate: new Date()
      },
      { new: true }
    );

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 🔹 Soft Delete Student */
exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    res.json({ message: "Student removed successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 🔹 Search Student */
exports.searchStudent = async (req, res) => {
  try {
    const { query } = req.query;

    const students = await Student.find({
      isDeleted: false,
      $or: [
        { studentId: { $regex: query, $options: "i" } },
        { fullName: { $regex: query, $options: "i" } },
        { nic: { $regex: query, $options: "i" } }
      ]
    });

    res.json(students);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};