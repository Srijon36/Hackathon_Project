const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Predicts next month's electricity bill using Claude AI
 * @param {Array} billHistory - Array of last 3 bill objects from DB (oldest first)
 * @returns {Object} prediction result
 */
const predictNextMonthBill = async (billHistory) => {
  if (!billHistory || billHistory.length < 2) {
    throw new Error(
      "At least 2 months of bill history required for prediction"
    );
  }

  // Format bill history using your exact schema fields
  const billSummary = billHistory
    .map((bill, index) => {
      // Use billMonth if available, else fall back to date parsing
      const monthLabel =
        bill.billMonth && bill.billMonth !== "N/A"
          ? bill.billMonth
          : new Date(bill.billDate || bill.createdAt).toLocaleString(
              "default",
              { month: "long", year: "numeric" }
            );

      return `Month ${index + 1} (${monthLabel}):
  - Units Billed: ${bill.unitsBilled} kWh
  - Energy Charges: ₹${bill.energyCharges}
  - Fixed/Demand Charges: ₹${bill.fixedDemandCharges}
  - Govt Duty: ₹${bill.govtDuty}
  - Meter Rent: ₹${bill.meterRent}
  - Adjustments: ₹${bill.adjustments}
  - Gross Amount: ₹${bill.grossAmount}
  - Rebate: ₹${bill.rebate}
  - Net Amount (Final Payable): ₹${bill.netAmount}
  - Cost per Unit: ₹${
        bill.unitsBilled > 0
          ? (bill.energyCharges / bill.unitsBilled).toFixed(2)
          : "N/A"
      }
  - Consumer Type: ${bill.consumerType}
  - Load (KVA): ${bill.loadKVA}`;
    })
    .join("\n\n");

  const prompt = `You are an expert electricity bill analyst in India. Based on the following electricity bill history, predict the next month's bill accurately.

BILL HISTORY:
${billSummary}

Analyze the trend in units consumed, energy charges, and net amount. Consider:
- Usage trend (increasing/decreasing/stable)
- Fixed charges that remain constant (fixed demand charges, meter rent)
- Variable charges that depend on units (energy charges, govt duty)
- Any rebates applied previously

Predict next month's bill. Respond ONLY in this exact JSON format with no extra text, no markdown, no backticks:
{
  "predictedUnits": <number>,
  "predictedEnergyCharges": <number>,
  "predictedGrossAmount": <number>,
  "predictedNetAmount": <number>,
  "trend": "<increasing | decreasing | stable>",
  "trendPercentage": <number>,
  "reason": "<2-3 line explanation of why you predicted this>",
  "savingTip": "<one specific actionable energy saving tip based on this usage pattern>"
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  // Extract text from Claude response
  const rawText = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  // Clean and parse JSON safely
  const cleanJson = rawText.replace(/```json|```/g, "").trim();
  const prediction = JSON.parse(cleanJson);

  return {
    success: true,
    prediction: {
      predictedUnits: prediction.predictedUnits,
      predictedEnergyCharges: prediction.predictedEnergyCharges,
      predictedGrossAmount: prediction.predictedGrossAmount,
      predictedNetAmount: prediction.predictedNetAmount,
      trend: prediction.trend,
      trendPercentage: Math.abs(prediction.trendPercentage),
      reason: prediction.reason,
      savingTip: prediction.savingTip,
    },
    basedOn: billHistory.length,
    generatedAt: new Date().toISOString(),
  };
};

module.exports = { predictNextMonthBill };