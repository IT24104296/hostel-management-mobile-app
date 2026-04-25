

/*
// ADD CONTRACT
router.post("/add", async (req, res) => {

  const { studentName, studentId, roomNumber, moveInDate, durationMonths } = req.body;

  // validation
  if (!studentName || !studentId || !roomNumber || !moveInDate || !durationMonths) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (durationMonths <= 0) {
    return res.status(400).json({ message: "Duration must be greater than 0" });
  }

  const moveIn = new Date(moveInDate);

  const endDate = new Date(moveIn);
  endDate.setMonth(endDate.getMonth() + durationMonths);

  const contract = new Contract({
    studentName,
    studentId,
    roomNumber,
    moveInDate,
    durationMonths,
    endDate
  });

  await contract.save();

  res.json({
    message: "Contract created successfully",
    contract
  });

});


// GET ALL CONTRACTS
router.get("/", async (req, res) => {

  const contracts = await Contract.find();

  res.json(contracts);

});

module.exports = router; */

/*
router.post("/add", async (req, res) => {
  const {
    studentName,
    studentId,
    contactNumber,
    moveInDate,
    durationMonths
  } = req.body;

  // REQUIRED
  if (!studentName || !studentId || !contactNumber || !moveInDate || !durationMonths) {
    return res.status(400).json({ message: "All fields required" });
  }

  // NAME
  if (!/^[A-Za-z ]+$/.test(studentName)) {
    return res.status(400).json({ message: "Invalid name" });
  }

  // ID (2 letters + 6 numbers)
  if (!/^[A-Z]{2}[0-9]{6}$/.test(studentId)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // CONTACT
  if (!/^[0-9]{10}$/.test(contactNumber)) {
    return res.status(400).json({ message: "Invalid contact number" });
  }

  // DURATION
  if (isNaN(durationMonths) || durationMonths <= 0) {
    return res.status(400).json({ message: "Invalid duration" });
  }

  const moveIn = new Date(moveInDate);
  const endDate = new Date(moveIn);
  endDate.setMonth(endDate.getMonth() + parseInt(durationMonths));

  try {
    const contract = new Contract({
      studentName,
      studentId,
      contactNumber,
      moveInDate,
      durationMonths,
      endDate
    });

    await contract.save();
    res.status(201).json({ message: "Saved" });
  } catch (err) {
    res.status(500).json({ message: "Error saving" });
  }
});

module.exports = router;*/




const express = require("express");
const router = express.Router();
const Contract = require("../models/Contract");


// ==============================
// ✅ ADD CONTRACT (POST)
// ==============================
router.post("/add", async (req, res) => {
  const {
    studentName,
    studentId,
    contactNumber,
    roomNumber,
    moveInDate,
    durationMonths
  } = req.body;

  //  REQUIRED FIELDS
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

  //  ID VALIDATION (2 letters + 6 numbers)
  if (!/^[A-Z]{2}[0-9]{6}$/.test(studentId)) {
    return res.status(400).json({ message: "Invalid ID format (HS240001)" });
  }

  //  CONTACT VALIDATION
  if (!/^[0-9]{10}$/.test(contactNumber)) {
    return res.status(400).json({ message: "Contact must be 10 digits" });
  }

  //  ROOM VALIDATION
  if (!/^[0-9]+$/.test(roomNumber)) {
    return res.status(400).json({ message: "Room must be numbers only" });
  }

  //  DURATION VALIDATION
  if (isNaN(durationMonths) || durationMonths <= 0) {
    return res.status(400).json({ message: "Duration must be greater than 0" });
  }

  //  CALCULATE END DATE
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
});


// ==============================
// ✅ GET ALL CONTRACTS
// ==============================
router.get("/", async (req, res) => {
  try {
    const contracts = await Contract.find().sort({ createdAt: -1 });
    res.json(contracts);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching contracts" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Contract.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Contract not found" });
    }

    res.json({ message: "Contract deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting contract" });
  }
});

module.exports = router;