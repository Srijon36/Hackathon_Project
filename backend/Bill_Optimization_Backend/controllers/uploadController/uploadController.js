const Bill = require("../../models/billModel/billModel");

const {
  extractTextFromImage,
  extractTextFromPDF
} = require("../../services/ocrService");

const {
  parseBill
} = require("../../services/aiParserService");

exports.scanAndCreateBill = async (req, res,next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const { buffer, mimetype } = req.file;

    let extractedText;

    // OCR / PDF extraction
    if (mimetype === "application/pdf") {
      extractedText = await extractTextFromPDF(buffer);
    } else {
      extractedText = await extractTextFromImage(buffer);
    }

    // ⚠️ Extra safety (very important)
    if (!extractedText || extractedText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from file"
      });
    }

    // AI parsing
    const parsedBill = await parseBill(extractedText);

    const billData = {
      userId: req.user.id,

      consumerNumber: parsedBill.consumerNumber || "UNKNOWN",
      customerName: parsedBill.customerName || "UNKNOWN",
      address: parsedBill.address || "",

      billMonth: parsedBill.billMonth || "Unknown",
      billDate: parsedBill.billDate ? new Date(parsedBill.billDate) : new Date(),
      dueDate: parsedBill.dueDate ? new Date(parsedBill.dueDate) : new Date(),

      unitsBilled: Number(parsedBill.unitsBilled) || 0,
      energyCharges: Number(parsedBill.energyCharges) || 0,
      fixedDemandCharges: Number(parsedBill.fixedDemandCharges) || 0,
      govtDuty: Number(parsedBill.govtDuty) || 0,
      meterRent: Number(parsedBill.meterRent) || 0,

      adjustments: Number(parsedBill.adjustments) || 0,
      rebate: Number(parsedBill.rebate) || 0,

      grossAmount: Number(parsedBill.grossAmount) || 0,
      netAmount: Number(parsedBill.netAmount) || 0
    };

    const bill = await Bill.create(billData);

    res.status(201).json({
      success: true,
      message: "Bill scanned and created successfully",
      data: bill
    });

  } catch (error) {
    console.error("Scan Bill Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to scan bill"
    });
  }
};