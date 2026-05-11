// controllers/recommendationController/recommendationController.js
const Anthropic  = require("@anthropic-ai/sdk");
const Appliance  = require("../../models/applianceModel/applianceModel");
const Bill       = require("../../models/billModel/billModel");
const { runRulesEngine }  = require("../../services/rulesEngineService");
const { calculateScore }  = require("../../services/savingsScoreService");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    const [profile, latestBill] = await Promise.all([
      Appliance.findOne({ userId }),
      Bill.findOne({ userId }).sort({ createdAt: -1 }).lean(),
    ]);

    if (!profile?.appliances?.length) {
      return res.status(400).json({
        success: false,
        message: "Fill your appliance profile first.",
      });
    }

    if (!latestBill) {
      return res.status(400).json({
        success: false,
        message: "Upload at least one bill first.",
      });
    }

    // Step 1 — Rules engine (pure math, no AI)
    const rules = runRulesEngine(profile.appliances, latestBill);

    // Step 2 — Score
    const scoreData = calculateScore(profile.appliances, latestBill);

    // Step 3 — Total potential savings
    const totalSavings = rules.reduce((s, r) => s + r.estimatedSavings, 0);

    // Step 4 — AI summary (explains only, no new numbers)
    const rulesSummary = rules
      .slice(0, 5)
      .map((r) => `- ${r.message}`)
      .join("\n");

    const prompt = `
You are an energy advisor for Indian households.
The system has calculated these specific recommendations:

${rulesSummary}

Consumer type: ${profile.consumerType}
Energy Score: ${scoreData.score}/100 (Grade ${scoreData.grade})
Bill Month: ${latestBill.billMonth}
Units Used: ${latestBill.unitsBilled} kWh
Total Potential Monthly Savings: ₹${totalSavings}

Write a friendly, personalized 3-4 sentence summary.
Use exact numbers from above. Do NOT invent new savings figures.
Address the user directly. Be encouraging but honest.
    `;

    const aiRes = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 250,
      messages: [{ role: "user", content: prompt }],
    });

    const aiSummary = aiRes.content[0]?.text || "";

    return res.status(200).json({
      success: true,
      score:            scoreData,
      recommendations:  rules,
      aiSummary,
      totalPotentialSavings: totalSavings,
      billMonth:        latestBill.billMonth,
      unitsUsed:        latestBill.unitsBilled,
    });

  } catch (error) {
    console.error("❌ getRecommendations error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};