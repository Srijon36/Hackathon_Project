const express = require("express");
const router = express.Router();

const analysisController = require("../../controllers/analysisController/analysisController");

// Generate analysis
router.get("/bill-analysis/:billId", analysisController.getBillAnalysis);

// Compare last two bills
router.get("/compare-bills", analysisController.compareBills);

module.exports = router;