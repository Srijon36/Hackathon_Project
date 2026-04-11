// services/billpredictionService.js
const Anthropic = require("@anthropic-ai/sdk");
const Appliance = require("../models/applianceModel/applianceModel");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const predictNextMonthBill = async (billHistory, userId) => {
  if (!billHistory || billHistory.length < 2) {
    throw new Error("At least 2 months of bill history required");
  }

  // ── Fetch appliance profile ──────────────────────────────────────────────
  const applianceProfile = await Appliance.findOne({ userId });

  // ── Calculate kWh/month for each appliance on the fly ───────────────────
  let applianceSection = "No appliance profile provided.";
  let totalApplianceKwh = 0;

  if (applianceProfile?.appliances?.length) {
    const applianceLines = applianceProfile.appliances.map((a) => {
      const kwhPerMonth = parseFloat(
        ((a.quantity * a.wattage * a.hoursPerDay * 30) / 1000).toFixed(2)
      );
      totalApplianceKwh += kwhPerMonth;
      return `  - ${a.name}: ${a.quantity} unit(s) × ${a.wattage}W × ${a.hoursPerDay}hrs/day = ${kwhPerMonth} kWh/month`;
    });

    applianceSection = `
Consumer Type: ${applianceProfile.consumerType}
Appliances:
${applianceLines.join("\n")}
Total Estimated Appliance Consumption: ${totalApplianceKwh.toFixed(2)} kWh/month`;
  }

  // ── Format bill history ──────────────────────────────────────────────────
  const billSummary = billHistory
    .map((bill, index) => {
      const monthLabel =
        bill.billMonth && bill.billMonth !== "N/A"
          ? bill.billMonth
          : new Date(bill.billDate || bill.createdAt).toLocaleString(
              "default", { month: "long", year: "numeric" }
            );

      const ratePerUnit =
        bill.unitsBilled > 0
          ? (bill.energyCharges / bill.unitsBilled).toFixed(2)
          : "N/A";

      return `Month ${index + 1} (${monthLabel}):
  - Units Billed: ${bill.unitsBilled} kWh
  - Energy Charges: ₹${bill.energyCharges}
  - Fixed/Demand Charges: ₹${bill.fixedDemandCharges}
  - Govt Duty: ₹${bill.govtDuty}
  - Meter Rent: ₹${bill.meterRent}
  - Adjustments: ₹${bill.adjustments}
  - Gross Amount: ₹${bill.grossAmount}
  - Rebate: ₹${bill.rebate}
  - Net Amount: ₹${bill.netAmount}
  - Rate per Unit: ₹${ratePerUnit}/kWh
  - Consumer Type: ${bill.consumerType}
  - Load (KVA): ${bill.loadKVA}`;
    })
    .join("\n\n");

  // ── Latest rate per unit for appliance cost context ──────────────────────
  const latestBill = billHistory[billHistory.length - 1];
  const ratePerUnit =
    latestBill.unitsBilled > 0
      ? (latestBill.energyCharges / latestBill.unitsBilled).toFixed(2)
      : 5.0;

  // ── Claude prompt ────────────────────────────────────────────────────────
  const prompt = `You are an expert electricity bill analyst in India.

BILL HISTORY (oldest to newest):
${billSummary}

HOUSEHOLD APPLIANCE PROFILE:
${applianceSection}
Current rate per unit: ₹${ratePerUnit}/kWh

Using both the bill history AND the appliance profile:
1. Cross-reference actual billed units vs estimated appliance consumption
2. Identify which appliances are likely driving consumption trends
3. Consider fixed charges (meter rent, fixed demand) that stay constant
4. Factor in seasonal patterns if visible across months

Respond ONLY in this exact JSON format, no markdown, no backticks:
{
  "predictedUnits": <number>,
  "predictedEnergyCharges": <number>,
  "predictedGrossAmount": <number>,
  "predictedNetAmount": <number>,
  "trend": "<increasing | decreasing | stable>",
  "trendPercentage": <number>,
  "reason": "<3-4 lines explaining prediction using BOTH bill history and appliance data>",
  "topConsumingAppliance": "<appliance name driving most consumption>",
  "savingTip": "<specific tip targeting the top consuming appliance>"
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const prediction = JSON.parse(rawText.replace(/```json|```/g, "").trim());

  return {
    success: true,
    prediction: {
      predictedUnits:        prediction.predictedUnits,
      predictedEnergyCharges: prediction.predictedEnergyCharges,
      predictedGrossAmount:  prediction.predictedGrossAmount,
      predictedNetAmount:    prediction.predictedNetAmount,
      trend:                 prediction.trend,
      trendPercentage:       Math.abs(prediction.trendPercentage),
      reason:                prediction.reason,
      topConsumingAppliance: prediction.topConsumingAppliance,
      savingTip:             prediction.savingTip,
    },
    basedOn:     billHistory.length,
    generatedAt: new Date().toISOString(),
  };
};

module.exports = { predictNextMonthBill };