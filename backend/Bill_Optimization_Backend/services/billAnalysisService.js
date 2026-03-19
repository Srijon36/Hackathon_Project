const analyzeBill = (bill) => {

  const suggestions = [];

  if (bill.unitsBilled > 300) {
    suggestions.push("Your electricity consumption is high. Consider energy efficient appliances.");
  }

  if (bill.fixedDemandCharges > 500) {
    suggestions.push("Check if your tariff plan can be optimized.");
  }

  if (bill.govtDuty > 200) {
    suggestions.push("Review government duty charges with your electricity provider.");
  }

  return {
    totalUnits: bill.unitsBilled,
    totalAmount: bill.netAmount,
    suggestions
  };
};

module.exports = { analyzeBill };