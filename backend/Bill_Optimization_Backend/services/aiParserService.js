const OpenAI = require("openai");

const getClient = () => {
  return new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });
};

const parseBill = async (text) => {
  try {
    if (!process.env.NVIDIA_API_KEY) {
      console.warn("⚠️ No NVIDIA API key. Using regex fallback.");
      return regexFallback(text);
    }

    const client = getClient();

    const prompt = `
You are an expert in reading Indian electricity bills.
Extract fields from the bill text below.
Return ONLY a valid JSON object. No explanation. No markdown. No code blocks.

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

    const completion = await client.chat.completions.create({
      model: "z-ai/glm4.7",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      top_p: 1,
      max_tokens: 1000,
      stream: true,
    });

    let raw = "";
    for await (const chunk of completion) {
      raw += chunk.choices[0]?.delta?.content || "";
    }

    console.log("🤖 Raw AI response:", raw);

    // ✅ Clean markdown
    raw = raw.replace(/```json|```/g, "").trim();

    // ✅ Extract JSON if wrapped in text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) raw = jsonMatch[0];

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.warn("⚠️ AI JSON parse failed, using regex fallback");
      return regexFallback(text);
    }

    // ✅ Always boost with regex
    parsed = enrichWithRegex(parsed, text);

    return parsed;

  } catch (error) {
    console.error("⚠️ AI parsing failed:", error.message);
    return regexFallback(text);
  }
};

// ✅ STRONG REGEX EXTRACTION
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

// ✅ REGEX BOOST — covers common Indian bill formats
const enrichWithRegex = (data, text) => {
  try {

    // ── Consumer Number ──
    if (!data.consumerNumber || data.consumerNumber === "N/A") {
      const match =
        text.match(/Consumer\s*No\.?\s*[:\-]?\s*(\d+)/i) ||
        text.match(/UNIQUE\s*[ID:]+\s*(\d+)/i) ||
        text.match(/Account\s*No\.?\s*[:\-]?\s*(\d+)/i) ||
        text.match(/\b(\d{10,14})\b/); // long number = likely consumer no
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
        text.match(/Units?\s*(?:Billed|Consumed|Used)?[:\s]+(\d+)/i) ||
        text.match(/(\d+)\s*(?:Units|kWh)/i);
      if (match) data.unitsBilled = Number(match[1]);
    }

    // ── Net Amount ──
    if (!data.netAmount || data.netAmount === 0) {
      const match =
        text.match(/Net\s*Amoun?t?[:\s₹Rs.]+(\d+(?:\.\d+)?)/i) ||
        text.match(/Amount\s*Payable[:\s₹Rs.]+(\d+(?:\.\d+)?)/i) ||
        text.match(/Total\s*Amount[:\s₹Rs.]+(\d+(?:\.\d+)?)/i);
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
        text.match(/Energy\s*Charges?[:\s₹Rs.]+(\d+(?:\.\d+)?)/i);
      if (match) data.energyCharges = Number(match[1]);
    }

    // ── Fixed/Demand Charges ──
    if (!data.fixedDemandCharges || data.fixedDemandCharges === 0) {
      const match =
        text.match(/Fixed\s*(?:Demand)?\s*Charges?[:\s₹Rs.]+(\d+(?:\.\d+)?)/i) ||
        text.match(/Demand\s*Charges?[:\s₹Rs.]+(\d+(?:\.\d+)?)/i);
      if (match) data.fixedDemandCharges = Number(match[1]);
    }

    // ── Govt Duty ──
    if (!data.govtDuty || data.govtDuty === 0) {
      const match =
        text.match(/Govt\.?\s*Duty[:\s₹Rs.]+(\d+(?:\.\d+)?)/i) ||
        text.match(/Government\s*Duty[:\s₹Rs.]+(\d+(?:\.\d+)?)/i);
      if (match) data.govtDuty = Number(match[1]);
    }

    // ── Meter Rent ──
    if (!data.meterRent || data.meterRent === 0) {
      const match =
        text.match(/Meter\s*Rent[:\s₹Rs.]+(\d+(?:\.\d+)?)/i);
      if (match) data.meterRent = Number(match[1]);
    }

    // ── Rebate ──
    if (!data.rebate || data.rebate === 0) {
      const match =
        text.match(/Rebate[:\s₹Rs.]+(\d+(?:\.\d+)?)/i);
      if (match) data.rebate = Number(match[1]);
    }

    // ── Due Date ──
    if (!data.dueDate) {
      const match =
        text.match(/Due\s*Date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i) ||
        text.match(/Pay\s*By[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
      if (match) data.dueDate = match[1];
    }

    // ── Bill Date ──
    if (!data.billDate) {
      const match =
        text.match(/Bill\s*Date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i) ||
        text.match(/Issue\s*Date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
      if (match) data.billDate = match[1];
    }

    // ── Bill Month ──
    if (!data.billMonth) {
      const match =
        text.match(/Bill\s*(?:Month|Period)[:\s]+([A-Za-z]+\s*\d{4})/i) ||
        text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}/i);
      if (match) data.billMonth = match[1] || match[0];
    }

  } catch (err) {
    console.warn("⚠️ Regex enrichment failed:", err.message);
  }

  return data;
};

const fallbackResponse = (text) => ({
  consumerNumber: "",
  customerName: "",
  address: "",
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
  rawText: text,
});

module.exports = { parseBill };
