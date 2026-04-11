const express = require("express");
const router = express.Router();

const { saveApplianceProfile, getApplianceProfile } = require("../../controllers/applianceController/applianceController");
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");

// POST /api/appliances/save
router.post("/save", protect, saveApplianceProfile);

// GET  /api/appliances/profile
router.get("/profile", protect, getApplianceProfile); // ✅ renamed from /get → /profile

module.exports = router;