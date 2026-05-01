const Contract = require("../../models/contract/Contract");

// ==============================
//  ADD CONTRACT
// ==============================
exports.addContract = async (req, res) => {
  const {
    studentName,
    studentId,
    contactNumber,
    roomNumber,
    moveInDate,
    durationMonths
  } = req.body;

  // REQUIRED FIELDS
  if (
    !studentName ||
    !studentId ||
    !contactNumber ||
    !roomNumber ||
    !moveInDate ||
    !durationMonths
  ) {
    return res.status(400).json({ message: "All fields required" });
  }

  // NAME VALIDATION
  if (!/^[A-Za-z ]+$/.test(studentName)) {
    return res.status(400).json({ message: "Name must contain only letters" });
  }

  // CONTACT VALIDATION
  if (!/^[0-9]{10}$/.test(contactNumber)) {
    return res.status(400).json({ message: "Contact must be 10 digits" });
  }

  // ROOM VALIDATION
  if (!/^[0-9]+$/.test(roomNumber)) {
    return res.status(400).json({ message: "Room must be numbers only" });
  }

  // DURATION VALIDATION
  if (isNaN(durationMonths) || durationMonths <= 0) {
    return res.status(400).json({ message: "Duration must be greater than 0" });
  }

  // CALCULATE END DATE
  const moveIn = new Date(moveInDate);
  const endDate = new Date(moveIn);
  endDate.setMonth(endDate.getMonth() + parseInt(durationMonths));

  try {
    const contract = new Contract({
      studentName,
      studentId,
      contactNumber,
      roomNumber,
      moveInDate,
      durationMonths,
      endDate
    });

    await contract.save();

    res.status(201).json({ message: "Saved successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error saving contract" });
  }
};


// ==============================
//  GET ALL CONTRACTS
// ==============================
exports.getContracts = async (req, res) => {
  try {
    const contracts = await Contract.find().sort({ createdAt: -1 });
    res.json(contracts);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching contracts" });
  }
};

// ==============================
//  UPDATE CONTRACT
// ==============================
exports.updateContract = async (req, res) => {
  const { id } = req.params;
  const { studentName, studentId, contactNumber, roomNumber, moveInDate, durationMonths } = req.body;

  try {
    const moveIn = new Date(moveInDate);
    const endDate = new Date(moveIn);
    endDate.setMonth(endDate.getMonth() + parseInt(durationMonths));

    const updatedContract = await Contract.findByIdAndUpdate(
      id,
      {
        studentName,
        studentId,
        contactNumber,
        roomNumber,
        moveInDate,
        durationMonths: Number(durationMonths),
        endDate
      },
      { new: true }
    );

    if (!updatedContract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    res.json({ message: "Contract updated successfully", contract: updatedContract });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating contract" });
  }
};
// ==============================
//  DELETE CONTRACT
// ==============================
exports.deleteContract = async (req, res) => {
  try {
    const deleted = await Contract.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Contract not found" });
    }

    res.json({ message: "Contract deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error deleting contract" });
  }
};