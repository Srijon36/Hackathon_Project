const express = require("express");
const router = express.Router();

const billController = require("../../controllers/billController/billController");

// correct middleware import
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");

router.post("/create-bill", protect, billController.createBill);
router.get("/all-bills", protect, billController.getAllBills);
router.get("/:id", protect, billController.getBillById);
router.put("/:id", protect, billController.updateBill);
router.delete("/:id", protect, billController.deleteBill);

module.exports = router;