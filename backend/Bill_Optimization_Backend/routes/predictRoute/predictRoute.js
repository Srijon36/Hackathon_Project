// routes/predictRoute/predictRoute.js
const express = require("express");
const router  = express.Router();
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");
const { getPrediction, getBreakdown } = require("../../controllers/predictController/predictController");

router.get("/next-month",          protect, getPrediction);
router.get("/appliance-breakdown", protect, getBreakdown);

module.exports = router;