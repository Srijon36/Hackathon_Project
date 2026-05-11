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

//////    RATHI GHOSH     ///////

// ── Add Single Appliance ──────────────────────────
const addAppliance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, icon, quantity, hoursPerDay, wattage, starRating } = req.body;

    if (!name || !wattage) {
      return res.status(400).json({
        success: false,
        message: "Name and wattage are required.",
      });
    }

    let profile = await Appliance.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Create appliance profile first.",
      });
    }

    // Check duplicate
    const exists = profile.appliances.find(
      (a) => a.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Appliance already exists. Update it instead.",
      });
    }

    profile.appliances.push({
      name,
      icon: icon || "🔌",
      quantity: quantity || 1,
      hoursPerDay: hoursPerDay || 1,
      wattage,
      starRating: starRating || null,
    });

    profile.updatedAt = new Date();
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Appliance added successfully.",
      data: profile,
    });
  } catch (error) {
    console.error("❌ addAppliance error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ── Delete Single Appliance ───────────────────────
const deleteAppliance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { applianceId } = req.params;

    const profile = await Appliance.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "No appliance profile found.",
      });
    }

    const before = profile.appliances.length;
    profile.appliances = profile.appliances.filter(
      (a) => a._id.toString() !== applianceId
    );

    if (profile.appliances.length === before) {
      return res.status(404).json({
        success: false,
        message: "Appliance not found.",
      });
    }

    profile.updatedAt = new Date();
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Appliance deleted successfully.",
      data: profile,
    });
  } catch (error) {
    console.error("❌ deleteAppliance error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ── Update Single Appliance ───────────────────────
const updateAppliance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { applianceId } = req.params;
    const { quantity, hoursPerDay, wattage, starRating } = req.body;

    const profile = await Appliance.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "No appliance profile found.",
      });
    }

    const appliance = profile.appliances.id(applianceId);

    if (!appliance) {
      return res.status(404).json({
        success: false,
        message: "Appliance not found.",
      });
    }

    if (quantity !== undefined)    appliance.quantity    = quantity;
    if (hoursPerDay !== undefined) appliance.hoursPerDay = hoursPerDay;
    if (wattage !== undefined)     appliance.wattage     = wattage;
    if (starRating !== undefined)  appliance.starRating  = starRating;

    profile.updatedAt = new Date();
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Appliance updated successfully.",
      data: profile,
    });
  } catch (error) {
    console.error("❌ updateAppliance error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  saveApplianceProfile,
  getApplianceProfile,
  addAppliance,
  deleteAppliance,
  updateAppliance,
};