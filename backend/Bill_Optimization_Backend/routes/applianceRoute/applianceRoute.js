const express = require("express");
const router = express.Router();

const { saveApplianceProfile, getApplianceProfile } = require("../../controllers/applianceController/applianceController");
const { protect } = require("../../middlewares/authMiddleware/authMiddleware"); // ← destructure

// POST /api/appliances/save
router.post("/save", protect, saveApplianceProfile);

// GET  /api/appliances/get
router.get("/get", protect, getApplianceProfile);

module.exports = router;