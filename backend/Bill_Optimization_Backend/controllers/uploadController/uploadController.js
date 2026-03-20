const { extractTextFromImage, extractTextFromPDF } = require("../../services/ocrService");
const { parseBill } = require("../../services/aiParserService");
const Bill = require("../../models/billModel/billModel");

exports.scanAndCreateBill = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { mimetype, buffer } = req.file;

    // Step 1: Extract text
    let extractedText = "";
    if (mimetype === "application/pdf") {
      extractedText = await extractTextFromPDF(buffer);
    } else {
      extractedText = await extractTextFromImage(buffer);
    }

    console.log("📄 Extracted text length:", extractedText?.length);

    if (!extractedText || extractedText.trim().length < 10) {
      return res.status(422).json({
        success: false,
        message: "Could not extract text. Please upload a clearer image.",
      });
    }

    // Step 2: Parse with NVIDIA AI
    const billFields = await parseBill(extractedText);

    console.log("🤖 AI parsed fields:", billFields);

    // ✅ Step 3: Safe defaults — prevent validation errors
    const safeBillData = {
      consumerNumber:     billFields.consumerNumber     || "N/A",
      customerName:       billFields.customerName       || "N/A",
      billMonth:          billFields.billMonth          || "N/A",
      billDate:           billFields.billDate           ? new Date(billFields.billDate)   : new Date(),
      dueDate:            billFields.dueDate            ? new Date(billFields.dueDate)    : new Date(),
      address:            billFields.address            || "",
      consumerType:       ["Domestic", "Commercial", "Industrial"].includes(billFields.consumerType)
                            ? billFields.consumerType
                            : "Domestic",
      unitsBilled:        Number(billFields.unitsBilled)        || 0,
      energyCharges:      Number(billFields.energyCharges)      || 0,
      fixedDemandCharges: Number(billFields.fixedDemandCharges) || 0,
      govtDuty:           Number(billFields.govtDuty)           || 0,
      meterRent:          Number(billFields.meterRent)          || 0,
      adjustments:        Number(billFields.adjustments)        || 0,
      rebate:             Number(billFields.rebate)             || 0,
      grossAmount:        Number(billFields.grossAmount)        || 0,
      netAmount:          Number(billFields.netAmount)          || 0,
      loadKVA:            Number(billFields.loadKVA)            || 0,
      securityDeposit:    Number(billFields.securityDeposit)    || 0,
      rawText:            extractedText, // ✅ save OCR text for debugging
      userId:             req.user.id,
    };

    // Step 4: Save to DB
    const bill = await Bill.create(safeBillData);

    res.status(201).json({
      success: true,
      message: "Bill scanned and saved successfully",
      data: bill,
    });

  } catch (error) {
    console.error("❌ scanAndCreateBill error:", error.message);

    if (error instanceof SyntaxError) {
      return res.status(422).json({
        success: false,
        message: "AI could not parse the bill. Please upload a clearer image.",
      });
    }
    next(error);
  }
};