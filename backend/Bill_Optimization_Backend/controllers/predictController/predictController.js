// controllers/predictController/predictController.js
const Bill = require("../../models/billModel/billModel");
const { predictNextMonthBill } = require("../../services/billpredictionService");
const { getApplianceBreakdown } = require("../../services/applianceBreakdownService");

// ── GET /api/predict/next-month ──────────────────────────────────────────
const getPrediction = async (req, res) => {
  try {
    const userId = req.user.id;

    const billHistory = await Bill.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    if (!billHistory || billHistory.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Upload at least 2 bills to get a prediction.",
      });
    }

    // Pass userId so service can fetch appliance profile
    const result = await predictNextMonthBill(billHistory.reverse(), userId);
    return res.status(200).json(result);

  } catch (error) {
    console.error("Prediction error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Prediction failed.",
    });
  }
};

// ── GET /api/predict/appliance-breakdown ────────────────────────────────
const getBreakdown = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getApplianceBreakdown(userId);
    return res.status(200).json(result);

  } catch (error) {
    console.error("Breakdown error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Breakdown failed.",
    });
  }
};

module.exports = { getPrediction, getBreakdown };