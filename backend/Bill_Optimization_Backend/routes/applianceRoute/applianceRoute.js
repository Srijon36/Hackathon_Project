const express = require("express");
const router = express.Router();

const { saveApplianceProfile, getApplianceProfile, predictMonthlyUsage } = require("../../controllers/applianceController/applianceController");
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");

// POST /api/appliances/save
router.post("/save", protect, saveApplianceProfile);

// GET  /api/appliances/profile
router.get("/profile", protect, getApplianceProfile);

// POST /api/appliances/predict-monthly  ← AI seasonal prediction
router.post("/predict-monthly", protect, predictMonthlyUsage);

module.exports = router;