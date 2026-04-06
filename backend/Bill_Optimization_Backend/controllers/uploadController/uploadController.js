const { extractTextFromImage, extractTextFromPDF } = require("../../services/ocrService");
const Bill = require("../../models/billModel/billModel");

// ✅ Safe date helper — prevents "Invalid Date" mongoose cast errors
const isValidDate = (val) => {
  if (!val) return false;
  const d = new Date(val);
  return !isNaN(d.getTime());
};

exports.scanAndCreateBill = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { mimetype, buffer } = req.file;

    // Step 1: Send file directly to Claude Vision — returns parsed object
    let billFields = {};
    if (mimetype === "application/pdf") {
      billFields = await extractTextFromPDF(buffer);
    } else {
      billFields = await extractTextFromImage(buffer);
    }

    console.log("🤖 AI parsed fields:", billFields);

    // Basic sanity check — if everything is empty, reject
    const hasData =
      billFields.consumerNumber ||
      billFields.customerName ||
      billFields.netAmount > 0 ||
      billFields.grossAmount > 0;

    if (!hasData) {
      return res.status(422).json({
        success: false,
        message: "Could not read bill. Please upload a clearer image or PDF.",
      });
    }

    // Step 2: Safe defaults — prevent validation errors
    const safeBillData = {
      consumerNumber:     billFields.consumerNumber     || "N/A",
      customerName:       billFields.customerName       || "N/A",
      billMonth:          billFields.billMonth          || "N/A",
      billDate:           isValidDate(billFields.billDate) ? new Date(billFields.billDate) : new Date(),
      dueDate:            isValidDate(billFields.dueDate)  ? new Date(billFields.dueDate)  : new Date(),
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
      rawText:            JSON.stringify(billFields), // store parsed fields as reference
      userId:             req.user.id,
    };

    // Step 3: Save to DB
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