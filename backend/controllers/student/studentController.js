const Student = require("../../models/student/Student");

/*  Generate Student ID */

const generateStudentId = async () => {
  const lastStudent = await Student.findOne().sort({ createdAt: -1 });

  if (!lastStudent || !lastStudent.studentId) {
    return "S001";
  }

  const lastNumber = parseInt(lastStudent.studentId.replace("S", ""), 10) || 0;
  const nextNumber = lastNumber + 1;
  return `S${String(nextNumber).padStart(3, "0")}`;
};

/*  Register Student */
const createStudent = async (req, res) => {
  try {
    const {
      fullName,
      nic,
      phone,
      parentName,
      parentPhone,
      whatsapp,
      address,
      university,
      status,
      admissionDate,
      leavingDate,
    } = req.body;

    if (!fullName || !nic || !phone || !parentName || !parentPhone || !address) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const existingNic = await Student.findOne({ nic });
    if (existingNic) {
      return res.status(409).json({
        message: "NIC already exists",
      });
    }

    const studentId = await generateStudentId();

    const student = await Student.create({
      studentId,
      fullName,
      nic,
      phone,
      parentName,
      parentPhone,
      whatsapp,
      address,
      university,
      status: status || "active",
      admissionDate,
      leavingDate,
    });

    res.status(201).json({
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create student",
      error: error.message,
    });
  }
};

/*  Get All Active Students */
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({ isDeleted: false });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*  Get Single Student Profile */
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*  Update Student */
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

/*  Mark Student Inactive */
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

/*  Soft Delete Student */
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

/*  Search Student */
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

;


const deactivateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { status: "Inactive" },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Student marked as inactive successfully",
      student: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to deactivate student",
      error: error.message,
    });
  }
};

const deleteStudentPermanently = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Student deleted permanently",
      student: deletedStudent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete student permanently",
      error: error.message,
    });
  }
};

exports.deactivateStudent = deactivateStudent;
exports.deleteStudentPermanently = deleteStudentPermanently;
exports.createStudent = createStudent;