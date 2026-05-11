const getSlabRate = (units, slabs) => {
  if (!slabs || slabs.length === 0) {
    // CESC default slabs
    if (units <= 100) return 5;
    if (units <= 300) return 7;
    return 9;
  }
  const slab = slabs.find(
    (s) => units >= s.fromUnit && (s.toUnit === null || units <= s.toUnit)
  );
  return slab?.ratePerUnit || 7;
};

const runRulesEngine = (appliances, bill, slabs = []) => {
  const recommendations = [];
  const ratePerUnit     = getSlabRate(bill.unitsBilled || 0, slabs);
  const units           = bill.unitsBilled || 0;
  const netAmount       = bill.netAmount   || 0;

  appliances.forEach((a) => {
    const monthlyKwh = parseFloat(
      ((a.wattage * a.quantity * a.hoursPerDay * 30) / 1000).toFixed(2)
    );
    const monthlyCost = Math.round(monthlyKwh * ratePerUnit);

    // ── AC Rules ────────────────────────────────────
    if (a.name.toLowerCase().includes("air conditioner") ||
        a.name.toLowerCase().includes("ac")) {

      if (a.hoursPerDay > 10) {
        const saving = Math.round(
          2 * a.quantity * (a.wattage / 1000) * 30 * ratePerUnit
        );
        recommendations.push({
          category: "AC",
          appliance: a.name,
          message: `Reducing AC usage by 2 hrs/day can save ₹${saving}/month`,
          estimatedSavings: saving,
          priority: "high",
        });
      }

      if (a.hoursPerDay > 6 && a.starRating && a.starRating < 3) {
        const saving = Math.round(monthlyCost * 0.2);
        recommendations.push({
          category: "AC",
          appliance: a.name,
          message: `Upgrading to 5-star AC can save ₹${saving}/month`,
          estimatedSavings: saving,
          priority: "medium",
        });
      }

      if (a.quantity > 1 && a.hoursPerDay > 8) {
        const saving = Math.round(
          a.quantity * (a.wattage / 1000) * 4 * 30 * ratePerUnit
        );
        recommendations.push({
          category: "AC",
          appliance: a.name,
          message: `Using ${a.quantity} ACs heavily — zone cooling can save ₹${saving}/month`,
          estimatedSavings: saving,
          priority: "high",
        });
      }
    }

    // ── Fan Rules ────────────────────────────────────
    if (a.name.toLowerCase().includes("fan")) {
      if (!a.starRating || a.starRating < 3) {
        const bldcWatt   = 28;
        const currentKwh = (a.wattage * a.quantity * a.hoursPerDay * 30) / 1000;
        const bldcKwh    = (bldcWatt  * a.quantity * a.hoursPerDay * 30) / 1000;
        const saving     = Math.round((currentKwh - bldcKwh) * ratePerUnit);
        recommendations.push({
          category: "Fan",
          appliance: a.name,
          message: `Switching ${a.quantity} fan(s) to BLDC can save ₹${saving}/month`,
          estimatedSavings: saving,
          priority: "medium",
        });
      }
    }

    // ── Water Heater Rules ───────────────────────────
    if (a.name.toLowerCase().includes("water heater") ||
        a.name.toLowerCase().includes("geyser")) {

      if (a.hoursPerDay > 1) {
        const saving = Math.round(
          (a.wattage * a.quantity * (a.hoursPerDay - 1) * 30 / 1000) * ratePerUnit
        );
        recommendations.push({
          category: "WaterHeater",
          appliance: a.name,
          message: `Limit geyser to 30 mins/day — saves ₹${saving}/month`,
          estimatedSavings: saving,
          priority: "high",
        });
      }
    }

    // ── Refrigerator Rules ───────────────────────────
    if (a.name.toLowerCase().includes("refrigerator") ||
        a.name.toLowerCase().includes("fridge")) {

      if (a.starRating && a.starRating < 3) {
        const saving = Math.round(monthlyCost * 0.25);
        recommendations.push({
          category: "Refrigerator",
          appliance: a.name,
          message: `Old refrigerator costs extra ₹${saving}/month vs 5-star model`,
          estimatedSavings: saving,
          priority: "medium",
        });
      }
    }

    // ── High cost appliance alert ─────────────────────
    if (monthlyCost > 500) {
      recommendations.push({
        category: "Alert",
        appliance: a.name,
        message: `${a.name} costs ₹${monthlyCost}/month — your biggest expense`,
        estimatedSavings: 0,
        priority: "info",
      });
    }
  });

  // ── Bill-level rules ─────────────────────────────────
  if (units > 400) {
    recommendations.push({
      category: "Slab",
      appliance: "Overall",
      message: `You're in highest slab (₹${ratePerUnit}/unit). Reducing by 50 units saves ₹${Math.round(50 * ratePerUnit)}/month`,
      estimatedSavings: Math.round(50 * ratePerUnit),
      priority: "high",
    });
  }

  if (bill.paymentStatus === "Overdue") {
    recommendations.push({
      category: "Payment",
      appliance: "Bill",
      message: "Pay before due date to avoid 2% late surcharge",
      estimatedSavings: Math.round(netAmount * 0.02),
      priority: "high",
    });
  }

  // Sort: high → medium → info
  const order = { high: 0, medium: 1, info: 2 };
  recommendations.sort((a, b) => order[a.priority] - order[b.priority]);

  return recommendations;
};

module.exports = { runRulesEngine, getSlabRate };