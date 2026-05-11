const calculateScore = (appliances, bill) => {
  let score   = 100;
  const notes = [];

  appliances.forEach((a) => {
    const name = a.name.toLowerCase();

    // AC penalties
    if (name.includes("air conditioner") || name.includes("ac")) {
      if (a.hoursPerDay > 10) { score -= 20; notes.push("AC overuse"); }
      else if (a.hoursPerDay > 8) { score -= 10; notes.push("AC high usage"); }
      if (a.starRating && a.starRating < 3) { score -= 10; notes.push("Low star AC"); }
    }

    // Fan penalties
    if (name.includes("fan") && (!a.starRating || a.starRating < 3)) {
      score -= 5 * Math.min(a.quantity, 4);
      notes.push("Old fans");
    }

    // Geyser
    if ((name.includes("water heater") || name.includes("geyser"))
        && a.hoursPerDay > 1) {
      score -= 10;
      notes.push("Geyser overuse");
    }
  });

  // Bill penalties
  const units = bill.unitsBilled || 0;
  if (units > 400)      { score -= 20; notes.push("Very high consumption"); }
  else if (units > 300) { score -= 10; notes.push("High consumption"); }

  if (bill.paymentStatus === "Overdue") { score -= 10; notes.push("Overdue payment"); }

  return {
    score:  Math.max(score, 0),
    grade:  score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D",
    color:  score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444",
    notes,
  };
};

module.exports = { calculateScore };