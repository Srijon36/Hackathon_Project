const Appliance = require("../../models/applianceModel/applianceModel");

// ── Save or Update Appliance Profile ──────────
const saveApplianceProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { consumerType, appliances } = req.body;

    if (!consumerType || !appliances || appliances.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Consumer type and appliances are required.",
      });
    }

    // Upsert — create if not exists, update if exists
    const profile = await Appliance.findOneAndUpdate(
      { userId },
      { userId, consumerType, appliances, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Appliance profile saved successfully.",
      data: profile,
    });
  } catch (error) {
    console.error("❌ saveApplianceProfile error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ── Get Appliance Profile ──────────────────────
const getApplianceProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await Appliance.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "No appliance profile found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("❌ getApplianceProfile error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = { saveApplianceProfile, getApplianceProfile };