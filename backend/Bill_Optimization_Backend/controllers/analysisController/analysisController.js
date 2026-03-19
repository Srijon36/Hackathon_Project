const Bill = require("../../models/billModel/billModel");

// 🔹 Generate Analysis for a Bill
exports.getBillAnalysis = async (req, res,next) => {
  try {
    const { billId } = req.params;

    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found"
      });
    }

    // 🔹 Calculations
    const costPerUnit = bill.energyCharges / bill.unitsBilled;

    const averageDailyUsage = bill.unitsBilled / 30;

    const estimatedNextBill = bill.netAmount * 1.05;

    // 🔹 Usage Category
    let usageCategory = "Normal";

    if (bill.unitsBilled < 100) {
      usageCategory = "Low Consumption";
    } else if (bill.unitsBilled >= 100 && bill.unitsBilled < 300) {
      usageCategory = "Moderate Consumption";
    } else {
      usageCategory = "High Consumption";
    }

    // 🔹 Energy Saving Suggestions
    let savingTips = [];

    if (costPerUnit > 8) {
      savingTips.push("Electricity cost per unit is high. Try reducing heavy appliance usage.");
    }

    if (bill.unitsBilled > 200) {
      savingTips.push("Consider using energy-efficient appliances.");
    }

    savingTips.push("Turn off unused lights and devices.");
    savingTips.push("Use LED bulbs instead of incandescent bulbs.");

    res.status(200).json({
      success: true,
      billId: bill._id,
      billMonth: bill.billMonth,
      totalUnits: bill.unitsBilled,
      totalAmount: bill.netAmount,
      costPerUnit: costPerUnit.toFixed(2),
      averageDailyUsage: averageDailyUsage.toFixed(2),
      estimatedNextBill: estimatedNextBill.toFixed(2),
      usageCategory,
      savingTips
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 🔹 Compare Last 2 Bills
exports.compareBills = async (req, res,next) => {
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

    const latest = bills[0];
    const previous = bills[1];

    const unitDifference = latest.unitsBilled - previous.unitsBilled;
    const costDifference = latest.netAmount - previous.netAmount;

    res.status(200).json({
      success: true,
      latestBillMonth: latest.billMonth,
      previousBillMonth: previous.billMonth,
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