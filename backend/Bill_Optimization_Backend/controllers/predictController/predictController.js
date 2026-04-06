const Bill = require("../../models/billModel/billModel"); // ✅ adjust filename if different
const { predictNextMonthBill } = require("../../services/billpredictionService");

/**
 * GET /api/analysis/predict
 * Fetches last 3 bills of logged-in user and returns AI prediction
 */
const getPrediction = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ comes from authMiddleware after token verification

    // Fetch last 3 bills sorted by newest first
    const billHistory = await Bill.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(); // .lean() returns plain JS objects (includes virtuals if toObject: {virtuals:true})

    // Need at least 2 months to predict
    if (!billHistory || billHistory.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Not enough bill history. Please upload at least 2 months of bills to get a prediction.",
      });
    }

    // Reverse so oldest bill is first — better for trend analysis
    const sortedBills = billHistory.reverse();

    // Call prediction service
    const result = await predictNextMonthBill(sortedBills);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Prediction error:", error.message);

    // JSON parse error from Claude
    if (error instanceof SyntaxError) {
      return res.status(500).json({
        success: false,
        message: "Failed to parse AI prediction response. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Prediction failed. Please try again.",
    });
  }
};

module.exports = { getPrediction };