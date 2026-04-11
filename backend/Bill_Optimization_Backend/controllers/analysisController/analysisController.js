const Bill = require("../../models/billModel/billModel");

// 🔹 Generate Analysis for a Bill
exports.getBillAnalysis = async (req, res, next) => {
  try {
    const { billId } = req.params;

    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found"
      });
    }

    // ✅ Return the full bill object so frontend fields match directly
    res.status(200).json({
      success: true,
      data: bill, // frontend does: const bill = analysisData?.data || analysisData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 🔹 Compare Last 2 Bills
exports.compareBills = async (req, res, next) => {
  try {
    const bills = await Bill.find()
      .sort({ billDate: -1 })
      .limit(2);

    if (bills.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Not enough bills to compare"
      });
    }

    const currentBill  = bills[0];
    const previousBill = bills[1];

    const unitDifference = currentBill.unitsBilled - previousBill.unitsBilled;
    const costDifference = currentBill.netAmount   - previousBill.netAmount;

    // ✅ Return shape matches frontend:
    // comparisonData.currentBill.netAmount / .unitsBilled
    // comparisonData.previousBill.netAmount / .unitsBilled
    res.status(200).json({
      success: true,
      currentBill:  {
        billMonth:   currentBill.billMonth,
        netAmount:   currentBill.netAmount,
        unitsBilled: currentBill.unitsBilled,
      },
      previousBill: {
        billMonth:   previousBill.billMonth,
        netAmount:   previousBill.netAmount,
        unitsBilled: previousBill.unitsBilled,
      },
      unitDifference,
      costDifference,
      message:
        unitDifference > 0
          ? "Electricity consumption increased"
          : "Electricity consumption decreased"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};