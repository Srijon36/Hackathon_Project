// services/monthlyAppliancePredictionService.js
const Anthropic = require("@anthropic-ai/sdk");
const Appliance = require("../models/applianceModel/applianceModel");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/**
 * Predicts which appliances are used in each month of the year
 * and how many hours/day, based on Indian seasonal patterns.
 * @param {string} userId
 * @returns {{ success, predictions: { appliance, icon, months: [{month, hoursPerDay, isActive, reason}] }[], generatedAt }}
 */
const predictMonthlyApplianceUsage = async (userId) => {
  const profile = await Appliance.findOne({ userId });

  if (!profile?.appliances?.length) {
    throw new Error("No appliance profile found. Please save your appliances first.");
  }

  const applianceList = profile.appliances
    .map((a) => `- ${a.name} (${a.wattage}W, user-set: ${a.hoursPerDay} hrs/day, qty: ${a.quantity})`)
    .join("\n");

  const prompt = `You are an expert energy analyst for Indian households and businesses.

The user has selected the following appliances:
${applianceList}
Consumer Type: ${profile.consumerType}

Your task: For each appliance, predict realistic usage hours per day for every month of the year (Jan–Dec) considering Indian climate and seasonal patterns.

Rules:
- Air Conditioner / Cooler: Heavy use Apr–Sep (summer), 0 or minimal Nov–Feb (winter)
- Ceiling Fan / Table Fan: Heavy Apr–Sep, minimal Nov–Feb
- Room Heater / Immersion Rod / Water Heater (Geyser): Heavy Nov–Feb, 0 or minimal Apr–Sep
- Refrigerator: 24 hrs all year (runs continuously)
- Washing Machine / Dishwasher: 0.5 hrs/day max — these are used a few times a week, NOT daily for hours
- Iron / Clothes Dryer / Clothes Iron: 0.1–0.3 hrs/day max — occasional, only a few times per week
- Projector / Home Theatre: 0.5–1 hr/day — occasional leisure use
- Vacuum Cleaner: 0.2–0.3 hrs/day — used a few times a week
- Hair Dryer / Hair Straightener / Electric Shaver: 0.05–0.1 hrs/day
- Mixer / Grinder / Blender: 0.1–0.25 hrs/day — used briefly for cooking
- Toaster / Electric Kettle / Coffee Maker: 0.1–0.25 hrs/day
- Microwave / Oven / OTG: 0.2–0.5 hrs/day
- Laptop / Desktop PC / Monitor: 8 hrs/day for working adults, consistent year-round
- WiFi Router / CCTV / UPS / Refrigerator: 24 hrs, consistent year-round
- Television / Set-top Box: 5–8 hrs/day, consistent year-round
- LED Bulbs / Tube Lights: 6–8 hrs/day (evening use), slightly lower in summer (longer days)
- Air Purifier / Humidifier: Slightly higher Oct–Feb (pollution/dry season)
- Gaming Console: Slightly higher Nov–Feb (more indoor time)
- All hours must be between 0 and 24
- Occasional appliances should NEVER exceed 1 hr/day on peak months
- Keep the user's configured hoursPerDay as the PEAK season value for seasonal appliances; reduce proportionally for off-season
- For occasional-use appliances (iron, dryer, projector, vacuum, etc.), the configured hoursPerDay is already their peak and should stay that way year-round

Respond ONLY in this exact JSON format, no markdown, no backticks:
{
  "predictions": [
    {
      "appliance": "<name>",
      "icon": "<emoji>",
      "monthlyHours": [<Jan_hrs>, <Feb_hrs>, <Mar_hrs>, <Apr_hrs>, <May_hrs>, <Jun_hrs>, <Jul_hrs>, <Aug_hrs>, <Sep_hrs>, <Oct_hrs>, <Nov_hrs>, <Dec_hrs>],
      "peakMonths": ["<month name>"],
      "offMonths": ["<month name>"],
      "seasonalNote": "<one line explaining pattern>"
    }
  ],
  "summaryInsight": "<2 lines about overall seasonal energy pattern for this household>"
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const result = JSON.parse(rawText.replace(/```json|```/g, "").trim());

  // ₹/kWh defaults per consumer type
  const RATE_MAP = { domestic: 7, commercial: 9, industrial: 6.5 };
  const ratePerUnit = RATE_MAP[profile.consumerType] ?? 7;

  // Enrich with month labels + cost data
  const enriched = result.predictions.map((p) => {
    const profileAppliance = profile.appliances.find((a) => a.name === p.appliance);
    const wattage  = profileAppliance?.wattage  ?? 0;
    const quantity = profileAppliance?.quantity  ?? 1;

    const months = MONTHS.map((m, i) => {
      const hrs        = parseFloat((p.monthlyHours[i] ?? 0).toFixed(1));
      const kwhPerMonth = parseFloat(((wattage * quantity * hrs * 30) / 1000).toFixed(1));
      const costPerMonth = Math.round(kwhPerMonth * ratePerUnit);
      return {
        month:        m,
        hoursPerDay:  hrs,
        isActive:     hrs > 0,
        kwhPerMonth,
        costPerMonth,
      };
    });

    const annualKwh  = parseFloat(months.reduce((s, m) => s + m.kwhPerMonth,  0).toFixed(1));
    const annualCost = months.reduce((s, m) => s + m.costPerMonth, 0);

    return {
      appliance:    p.appliance,
      icon:         p.icon,
      wattage,
      quantity,
      peakMonths:   p.peakMonths,
      offMonths:    p.offMonths,
      seasonalNote: p.seasonalNote,
      months,
      annualKwh,
      annualCost,
    };
  });

  return {
    success:        true,
    consumerType:   profile.consumerType,
    ratePerUnit,
    predictions:    enriched,
    summaryInsight: result.summaryInsight,
    generatedAt:    new Date().toISOString(),
  };
};

module.exports = { predictMonthlyApplianceUsage };
