const express = require("express");
const router = express.Router();

const {
  addContract,
  getContracts,
  deleteContract
} = require("../../controllers/contract/ContractController");

const auth = require("../../middlewares/UserAuth/auth.middleware");
router.post("/add", auth, addContract);
router.get("/", auth, getContracts);
router.delete("/:id", auth, deleteContract);

module.exports = router;