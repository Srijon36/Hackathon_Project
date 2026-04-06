const express = require("express");
const router = express.Router();

const { getPrediction } = require("../../controllers/predictController/predictController");
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");

// GET /api/predict
router.get("/", protect, getPrediction);

module.exports = router;