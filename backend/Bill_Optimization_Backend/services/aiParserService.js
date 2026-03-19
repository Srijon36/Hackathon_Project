const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Safe initialization
let model = null;

if (process.env.GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // ✅ Use correct working model
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

} else {
  console.warn("⚠️ No Gemini API key found. AI parsing disabled.");
}


// ✅ MAIN FUNCTION
const parseBill = async (text) => {
  try {

    if (!model) {
      return fallbackResponse(text);
    }

    // ✅ IMPROVED PROMPT (IMPORTANT)
    const prompt = `
You are an expert in reading Indian electricity bills.

Extract the following fields strictly from the bill text.

Rules:
- Return ONLY valid JSON (no explanation, no extra text)
- If value not found, return empty string or 0
- Extract numbers carefully (no strings for numbers)
- Ignore unrelated text

JSON format:

{
 "consumerNumber":"",
 "customerName":"",
 "address":"",
 "billMonth":"",
 "billDate":"",
 "dueDate":"",
 "unitsBilled":0,
 "energyCharges":0,
 "fixedDemandCharges":0,
 "govtDuty":0,
 "meterRent":0,
 "adjustments":0,
 "rebate":0,
 "grossAmount":0,
 "netAmount":0
}

Bill text:
${text}
`;

    const result = await model.generateContent(prompt);

    let raw = result.response.text();

    // ✅ Clean markdown
    raw = raw.replace(/```json|```/g, "").trim();

    // ✅ SAFE JSON PARSE
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.warn("⚠️ JSON parse failed, trying fix...");

      const fixed = raw
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");

      parsed = JSON.parse(fixed);
    }

    // ✅ FALLBACK EXTRACTION (VERY IMPORTANT BOOST)
    parsed = enrichWithRegex(parsed, text);

    return parsed;

  } catch (error) {
    console.error("⚠️ Gemini parsing failed:", error.message);
    return fallbackResponse(text);
  }
};


// ✅ REGEX BOOST (THIS IMPROVES ACCURACY MASSIVELY)
const enrichWithRegex = (data, text) => {
  try {
    if (!data.unitsBilled || data.unitsBilled === 0) {
      const match = text.match(/Units\s*Billed[:\s]+(\d+)/i);
      if (match) data.unitsBilled = Number(match[1]);
    }

    if (!data.netAmount || data.netAmount === 0) {
      const match = text.match(/Net\s*Amount[:\s₹]+(\d+)/i);
      if (match) data.netAmount = Number(match[1]);
    }

    if (!data.grossAmount || data.grossAmount === 0) {
      const match = text.match(/Gross\s*Amount[:\s₹]+(\d+)/i);
      if (match) data.grossAmount = Number(match[1]);
    }

  } catch (err) {
    console.warn("Regex fallback failed");
  }

  return data;
};


// ✅ FALLBACK (SAFE MODE)
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
  rawText: text
});


module.exports = { parseBill };