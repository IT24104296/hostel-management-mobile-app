const Complaint = require("../../models/complaint/Complaint");

// ==============================
//  ADD NEW COMPLAINT
// ==============================
exports.addComplaint = async (req, res) => {
  const { title, category, roomNumber, studentName, description, priority } = req.body;

  if (!title || !category || !roomNumber || !description) {
    return res.status(400).json({ message: "Title, Category, Room Number and Description are required" });
  }

  try {
    const complaint = new Complaint({
      title,
      category,
      roomNumber,
      studentName: studentName || "",
      description,
      priority: priority || "Medium",
      status: "Pending",
    });

    await complaint.save();

    res.status(201).json({
      success: true,
      message: "Complaint added successfully",
      complaint,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding complaint" });
  }
};

// ==============================
//  GET ALL COMPLAINTS
// ==============================
exports.getComplaints = async (req, res) => {
  try {
    const { status, priority } = req.query;

    let query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching complaints" });
  }
};

// ==============================
//  GET SINGLE COMPLAINT
// ==============================
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({
      success: true,
      complaint,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching complaint" });
  }
};

// ==============================
//  UPDATE COMPLAINT
// ==============================
exports.updateComplaint = async (req, res) => {
  const { title, category, roomNumber, studentName, description, priority, status, notes } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Update fields
    if (title) complaint.title = title;
    if (category) complaint.category = category;
    if (roomNumber) complaint.roomNumber = roomNumber;
    if (studentName !== undefined) complaint.studentName = studentName;
    if (description) complaint.description = description;
    if (priority) complaint.priority = priority;
    if (status) complaint.status = status;
    if (notes !== undefined) complaint.notes = notes;

    // Auto-set resolvedDate when status becomes Resolved
    if (status === "Resolved" && complaint.status !== "Resolved") {
      complaint.resolvedDate = new Date();
    }

    await complaint.save();

    res.json({
      success: true,
      message: "Complaint updated successfully",
      complaint,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating complaint" });
  }
};

// ==============================
//  DELETE COMPLAINT
// ==============================
exports.deleteComplaint = async (req, res) => {
  try {
    const deleted = await Complaint.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting complaint" });
  }
};