const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");

const getClient = () => new Anthropic();

// ─────────────────────────────────────────────
// ✅ MAIN: Parse bill from file path (PDF or image)
// ─────────────────────────────────────────────
const parseBillFromFile = async (filePath) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠️ No Anthropic API key found.");
    return defaultEmpty();
  }

  const buffer = fs.readFileSync(filePath);
  const ext = filePath.split(".").pop().toLowerCase();

  const mediaType =
    ext === "pdf"
      ? "application/pdf"
      : ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : "image/png";

  return await parseBillFromBuffer(buffer, mediaType);
};

// ─────────────────────────────────────────────
// ✅ MAIN: Parse bill from buffer (PDF or image)
// ─────────────────────────────────────────────
const parseBillFromBuffer = async (buffer, mediaType = "application/pdf") => {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠️ No Anthropic API key found.");
    return defaultEmpty();
  }

  try {
    const client = getClient();
    const base64Data = buffer.toString("base64");

    const prompt = `You are an expert at reading Indian electricity bills (CESC, BESCOM, MSEDCL, TNEB, etc.).

Look carefully at this bill image and extract ALL fields listed below.
Return ONLY a valid JSON object. No explanation. No markdown. No code blocks.

Important extraction rules:
- consumerNumber: The main account/consumer number (usually 10-12 digits at the bottom or top)
- customerName: The customer's full name (usually near the address at top-left)
- address: Full address of the customer
- consumerType: Usually "Domestic" or "Commercial" — check near consumer type label
- billMonth: Month name (e.g. "JANUARY 2026") from "YOUR ELECTRICITY BILL FOR ..."
- billDate: Bill Date in DD/MM/YY or DD/MM/YYYY format
- dueDate: Due Date in DD/MM/YY or DD/MM/YYYY format
- unitsBilled: Number of units/kWh consumed this billing period
- energyCharges: Energy Charges amount (₹)
- fixedDemandCharges: Fixed/Demand Charges amount (₹)
- govtDuty: Government Duty amount (₹), 0 if not present
- meterRent: Meter Rent amount (₹)
- adjustments: Adjustments amount (₹), 0 if none
- rebate: Rebate amount (₹)
- grossAmount: Gross Amount (before rebate)
- netAmount: Net Amount Payable (after rebate)
- loadKVA: Sanctioned Load in KVA
- securityDeposit: Security Deposit amount (₹)
- fppas: FPPAS/FAC charge if present (₹), else 0

JSON format (all amounts as numbers, not strings):
{
  "consumerNumber": "",
  "customerName": "",
  "address": "",
  "consumerType": "Domestic",
  "billMonth": "",
  "billDate": "",
  "dueDate": "",
  "unitsBilled": 0,
  "energyCharges": 0,
  "fppas": 0,
  "fixedDemandCharges": 0,
  "govtDuty": 0,
  "meterRent": 0,
  "adjustments": 0,
  "rebate": 0,
  "grossAmount": 0,
  "netAmount": 0,
  "loadKVA": 0,
  "securityDeposit": 0
}`;

    const isImage = mediaType.startsWith("image/");

    // Build content block: PDF uses "document", images use "image"
    const fileBlock = isImage
      ? {
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: base64Data,
          },
        }
      : {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: base64Data,
          },
        };

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            fileBlock,
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    let raw = message.content[0].text;
    console.log("🤖 Raw AI response:", raw);

    // Strip markdown fences if present
    raw = raw.replace(/```json|```/g, "").trim();

    // Extract JSON object
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) raw = jsonMatch[0];

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.warn("⚠️ JSON parse failed:", err.message);
      return defaultEmpty();
    }

    // Normalize: ensure all numeric fields are numbers, not strings
    const numericFields = [
      "unitsBilled", "energyCharges", "fppas", "fixedDemandCharges",
      "govtDuty", "meterRent", "adjustments", "rebate",
      "grossAmount", "netAmount", "loadKVA", "securityDeposit",
    ];
    for (const field of numericFields) {
      if (parsed[field] !== undefined) {
        parsed[field] = Number(parsed[field]) || 0;
      }
    }

    console.log("✅ AI parsed fields:", parsed);
    return parsed;

  } catch (error) {
    console.error("⚠️ AI parsing failed:", error.message);
    return defaultEmpty();
  }
};

// ─────────────────────────────────────────────
// Legacy: still accepts raw text (fallback only)
// ─────────────────────────────────────────────
const parseBill = async (text) => {
  console.warn(
    "⚠️ parseBill(text) called — for best results use parseBillFromBuffer() or parseBillFromFile() instead."
  );
  // Minimal text-based extraction as last resort
  return defaultEmpty();
};

const defaultEmpty = () => ({
  consumerNumber: "",
  customerName: "",
  address: "",
  consumerType: "Domestic",
  billMonth: "",
  billDate: "",
  dueDate: "",
  unitsBilled: 0,
  energyCharges: 0,
  fppas: 0,
  fixedDemandCharges: 0,
  govtDuty: 0,
  meterRent: 0,
  adjustments: 0,
  rebate: 0,
  grossAmount: 0,
  netAmount: 0,
  loadKVA: 0,
  securityDeposit: 0,
});

module.exports = { parseBill, parseBillFromBuffer, parseBillFromFile };