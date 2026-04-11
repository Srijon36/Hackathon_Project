// services/applianceBreakdownService.js
const Anthropic = require("@anthropic-ai/sdk");
const Appliance = require("../models/applianceModel/applianceModel");
const Bill      = require("../models/billModel/billModel");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const getApplianceBreakdown = async (userId) => {

  // ── Fetch data ───────────────────────────────────────────────────────────
  const [profile, latestBill] = await Promise.all([
    Appliance.findOne({ userId }),
    Bill.findOne({ userId }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!profile?.appliances?.length) {
    throw new Error("No appliance profile found. Please fill your appliance profile first.");
  }
  if (!latestBill) {
    throw new Error("No bill found. Please upload a bill first.");
  }

  // ── Calculate kWh per appliance ──────────────────────────────────────────
  const ratePerUnit =
    latestBill.unitsBilled > 0
      ? parseFloat((latestBill.energyCharges / latestBill.unitsBilled).toFixed(2))
      : 5.0;

  let totalApplianceKwh = 0;
  const applianceData = profile.appliances.map((a) => {
    const kwhPerMonth = parseFloat(
      ((a.quantity * a.wattage * a.hoursPerDay * 30) / 1000).toFixed(2)
    );
    totalApplianceKwh += kwhPerMonth;
    return {
      name:        a.name,
      quantity:    a.quantity,
      wattage:     a.wattage,
      hoursPerDay: a.hoursPerDay,
      kwhPerMonth,
    };
  });

  // ── Build prompt ─────────────────────────────────────────────────────────
  const applianceLines = applianceData
    .map(
      (a) =>
        `- ${a.name}: ${a.quantity} unit(s) × ${a.wattage}W × ${a.hoursPerDay}hrs/day = ${a.kwhPerMonth} kWh/month`
    )
    .join("\n");

  const prompt = `You are an energy cost analyst for Indian households.

LATEST ELECTRICITY BILL:
- Billing Month: ${latestBill.billMonth || "N/A"}
- Actual Units Billed: ${latestBill.unitsBilled} kWh
- Energy Charges: ₹${latestBill.energyCharges}
- Gross Amount: ₹${latestBill.grossAmount}
- Net Amount: ₹${latestBill.netAmount}
- Rate per Unit: ₹${ratePerUnit}/kWh

APPLIANCE PROFILE (${profile.consumerType}):
${applianceLines}
Total Estimated Appliance Consumption: ${totalApplianceKwh.toFixed(2)} kWh/month

The actual billed units are ${latestBill.unitsBilled} kWh but appliance estimates total ${totalApplianceKwh.toFixed(2)} kWh.
Scale each appliance's cost proportionally to match the actual bill of ₹${latestBill.energyCharges} in energy charges.

Respond ONLY in this exact JSON format, no markdown, no backticks:
{
  "breakdown": [
    {
      "appliance": "<name>",
      "kwhUsed": <scaled kWh as number>,
      "estimatedCost": <cost in ₹ as number>,
      "percentageOfBill": <% of total energy charges as number>,
      "savingTip": "<one specific tip to reduce this appliance's consumption>"
    }
  ],
  "totalEstimatedCost": <sum of all estimatedCost>,
  "topConsumer": "<appliance name with highest cost>",
  "summaryInsight": "<2 lines about overall consumption pattern and biggest opportunity to save>"
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const result = JSON.parse(rawText.replace(/```json|```/g, "").trim());

  return {
    success:     true,
    breakdown:   result,
    ratePerUnit,
    actualUnits: latestBill.unitsBilled,
    actualBill:  latestBill.netAmount,
    billMonth:   latestBill.billMonth,
    generatedAt: new Date().toISOString(),
  };
};

module.exports = { getApplianceBreakdown };