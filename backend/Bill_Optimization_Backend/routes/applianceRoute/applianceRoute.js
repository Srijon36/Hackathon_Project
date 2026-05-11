const express = require("express");
const router = express.Router();

const {
  saveApplianceProfile,
  getApplianceProfile,
  addAppliance,
  deleteAppliance,
  updateAppliance,
} = require("../../controllers/applianceController/applianceController");

const { protect } = require("../../middlewares/authMiddleware/authMiddleware");

router.post("/save",                        protect, saveApplianceProfile);
router.get("/profile",                      protect, getApplianceProfile);
router.post("/add",                         protect, addAppliance);
router.delete("/:applianceId",              protect, deleteAppliance);
router.patch("/:applianceId",               protect, updateAppliance);

module.exports = router;