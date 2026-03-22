const Anthropic = require("@anthropic-ai/sdk");

const getClient = () => {
  return new Anthropic();
};

const parseBill = async (text) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("⚠️ No Anthropic API key. Using regex fallback.");
      return regexFallback(text);
    }

    const client = getClient();

    const prompt = `You are an expert in reading Indian electricity bills, even when OCR text is noisy or garbled.
Try your best to extract fields from the bill text below, even if text looks corrupted.
Look for patterns like numbers near keywords, ignore garbage characters.
Return ONLY a valid JSON object. No explanation. No markdown. No code blocks.

Key hints:
- Consumer/Unique ID is usually a 10-14 digit number
- Net Amount / Amount Payable is the final amount to pay
- Units Billed is usually near "Units" or "kWh"
- Dates are in DD/MM/YYYY format
- Bill Month is a month name like JAN, FEB, MAR etc.
- Energy Charges is the main charge based on units consumed
- Fixed/Demand Charges is a flat monthly charge
- Govt Duty is a tax/duty applied on the bill
- Gross Amount is before rebate, Net Amount is after rebate

JSON format:
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
  "fixedDemandCharges": 0,
  "govtDuty": 0,
  "meterRent": 0,
  "adjustments": 0,
  "rebate": 0,
  "grossAmount": 0,
  "netAmount": 0,
  "loadKVA": 0,
  "securityDeposit": 0
}

Bill text:
${text}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    let raw = message.content[0].text;
    console.log("🤖 Raw AI response:", raw);

    // Clean markdown
    raw = raw.replace(/```json|```/g, "").trim();

    // Extract JSON if wrapped in text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) raw = jsonMatch[0];

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.warn("⚠️ AI JSON parse failed, using regex fallback");
      return regexFallback(text);
    }

    // Always boost with regex
    parsed = enrichWithRegex(parsed, text);
    return parsed;

  } catch (error) {
    console.error("⚠️ AI parsing failed:", error.message);
    return regexFallback(text);
  }
};

// ✅ REGEX FALLBACK
const regexFallback = (text) => {
  const data = {
    consumerNumber: "",
    customerName: "",
    address: "",
    consumerType: "Domestic",
    billMonth: "",
    billDate: "",
    dueDate: "",
    unitsBilled: 0,
    energyCharges: 0,
    fixedDemandCharges: 0,
    govtDuty: 0,
    meterRent: 0,
    adjustments: 0,
    rebate: 0,
    grossAmount: 0,
    netAmount: 0,
    loadKVA: 0,
    securityDeposit: 0,
  };
  return enrichWithRegex(data, text);
};

// ✅ REGEX ENRICHMENT
const enrichWithRegex = (data, text) => {
  try {
    // ── Consumer Number ──
    if (!data.consumerNumber || data.consumerNumber === "N/A") {
      const match =
        text.match(/Consumer\s*No\.?\s*[:\-]?\s*(\d+)/i) ||
        text.match(/UNIQUE\s*ID\s*[:\-]?\s*(\d+)/i) ||
        text.match(/Account\s*No\.?\s*[:\-]?\s*(\d+)/i) ||
        text.match(/\b(\d{10,14})\b/);
      if (match) data.consumerNumber = match[1].trim();
    }

    // ── Customer Name ──
    if (!data.customerName || data.customerName === "N/A") {
      const match =
        text.match(/(?:Name|Customer)[:\s]+([A-Z][A-Z\s]{3,30})/i) ||
        text.match(/^([A-Z][A-Z\s]{3,30})\s+\d{10,}/m);
      if (match) data.customerName = match[1].trim();
    }

    // ── Units Billed ──
    if (!data.unitsBilled || data.unitsBilled === 0) {
      const match =
        text.match(/Units?\s*Bl[di]+[:\s]+(\d+)/i) ||
        text.match(/Units?\s*(?:Billed|Consumed|Used)?[:\s]+(\d+)/i) ||
        text.match(/(\d+)\s*(?:Units|kWh)/i);
      if (match) data.unitsBilled = Number(match[1]);
    }

    // ── Net Amount ──
    if (!data.netAmount || data.netAmount === 0) {
      const match =
        text.match(/Net\s*Amoun?t?[:\s₹Rs.]+(\d+(?:\.\d+)?)/i) ||
        text.match(/Amount\s*Payable[:\s₹Rs.]+(\d+(?:\.\d+)?)/i) ||
        text.match(/Total\s*Amount[:\s₹Rs.]+(\d+(?:\.\d+)?)/i) ||
        text.match(/Payable[:\s₹Rs.]+(\d+(?:\.\d+)?)/i);
      if (match) data.netAmount = Number(match[1]);
    }

    // ── Gross Amount ──
    if (!data.grossAmount || data.grossAmount === 0) {
      const match =
        text.match(/Gross\s*Amoun?t?[:\s₹Rs.]+(\d+(?:\.\d+)?)/i);
      if (match) data.grossAmount = Number(match[1]);
    }

    // ── Energy Charges ──
    if (!data.energyCharges || data.energyCharges === 0) {
      const match =
        text.match(/Energy\s*Charges?[:\s₹Rs.]+(\d+(?:\.\d+)?)/i) ||
        text.match(/EC[:\s₹Rs.]+(\d+(?:\.\d+)?)/i);
      if (match) data.energyCharges = Number(match[1]);
    }

    // ── Fixed/Demand Charges ──
    if (!data.fixedDemandCharges || data.fixedDemandCharges === 0) {
      const match =
        text.match(/Fixed\s*(?:Demand)?\s*Charges?[:\s₹Rs.]+(\d+(?:\.\d+)?)/i) ||
        text.match(/Demand\s*Charges?[:\s₹Rs.]+(\d+(?:\.\d+)?)/i) ||
        text.match(/FC[:\s₹Rs.]+(\d+(?:\.\d+)?)/i);
      if (match) data.fixedDemandCharges = Number(match[1]);
    }

    // ── Govt Duty ──
    if (!data.govtDuty || data.govtDuty === 0) {
      const match =
        text.match(/Govt\.?\s*Duty[:\s₹Rs.]+(\d+(?:\.\d+)?)/i) ||
        text.match(/Government\s*Duty[:\s₹Rs.]+(\d+(?:\.\d+)?)/i) ||
        text.match(/GD[:\s₹Rs.]+(\d+(?:\.\d+)?)/i);
      if (match) data.govtDuty = Number(match[1]);
    }

    // ── Meter Rent ──
    if (!data.meterRent || data.meterRent === 0) {
      const match =
        text.match(/Meter\s*Rent[:\s₹Rs.]+(\d+(?:\.\d+)?)/i) ||
        text.match(/MR[:\s₹Rs.]+(\d+(?:\.\d+)?)/i);
      if (match) data.meterRent = Number(match[1]);
    }

    // ── Rebate ──
    if (!data.rebate || data.rebate === 0) {
      const match =
        text.match(/Rebate[:\s₹Rs.]+(\d+(?:\.\d+)?)/i);
      if (match) data.rebate = Number(match[1]);
    }

    // ── Adjustments ──
    if (!data.adjustments || data.adjustments === 0) {
      const match =
        text.match(/Adjustments?[:\s₹Rs.]+(\d+(?:\.\d+)?)/i);
      if (match) data.adjustments = Number(match[1]);
    }

    // ── Due Date ──
    if (!data.dueDate) {
      const match =
        text.match(/Due\s*Date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i) ||
        text.match(/Pay\s*By[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i) ||
        text.match(/Last\s*Date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
      if (match) data.dueDate = match[1];
    }

    // ── Bill Date ──
    if (!data.billDate) {
      const match =
        text.match(/Bill\s*Date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i) ||
        text.match(/Issue\s*Date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i) ||
        text.match(/Date\s*of\s*Issue[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
      if (match) data.billDate = match[1];
    }

    // ── Bill Month ──
    if (!data.billMonth) {
      const match =
        text.match(/Bill\s*(?:Month|Period)[:\s]+([A-Za-z]+\s*\d{4})/i) ||
        text.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s*\d{4}/i) ||
        text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}/i);
      if (match) data.billMonth = match[1] || match[0];
    }

    // ── Load KVA ──
    if (!data.loadKVA || data.loadKVA === 0) {
      const match =
        text.match(/Load\s*[:\s]+(\d+(?:\.\d+)?)\s*KVA/i) ||
        text.match(/Sanctioned\s*Load[:\s]+(\d+(?:\.\d+)?)/i) ||
        text.match(/Load\s*\[?kva\]?[:\s]+(\d+(?:\.\d+)?)/i);
      if (match) data.loadKVA = Number(match[1]);
    }

    // ── Security Deposit ──
    if (!data.securityDeposit || data.securityDeposit === 0) {
      const match =
        text.match(/Security\s*Depos[it]+[:\s₹Rs.]+(\d+(?:\.\d+)?)/i) ||
        text.match(/SD[:\s₹Rs.]+(\d+(?:\.\d+)?)/i);
      if (match) data.securityDeposit = Number(match[1]);
    }

  } catch (err) {
    console.warn("⚠️ Regex enrichment failed:", err.message);
  }

  return data;
};

module.exports = { parseBill };