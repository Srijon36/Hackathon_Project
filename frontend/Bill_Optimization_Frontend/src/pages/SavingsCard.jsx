const SavingsCard = ({ data }) => {
  // ✅ real DB fields with safe fallbacks
  const grossAmount = data?.grossAmount || 0;
  const netAmount   = data?.netAmount || 0;
  const rebate      = data?.rebate || 0;
  const saved       = grossAmount - netAmount;  // actual saving from rebate
  const yearlySavings = saved * 12;
  const percent     = grossAmount > 0
    ? Math.round((saved / grossAmount) * 100)
    : 0;

  return (
    <div className="dash-card">
      <h3>💰 Projected Savings</h3>
      <div className="dash-row">
        <span>Gross Bill</span>
        <strong>₹{grossAmount.toLocaleString("en-IN")}</strong>
      </div>
      <div className="dash-row">
        <span>Rebate Applied</span>
        <strong className="green">- ₹{rebate.toLocaleString("en-IN")}</strong>
      </div>
      <div className="dash-row">
        <span>Net Amount</span>
        <strong className="blue">₹{netAmount.toLocaleString("en-IN")}</strong>
      </div>
      <div className="dash-row">
        <span>Monthly Saving</span>
        <strong className="green">₹{saved.toLocaleString("en-IN")}</strong>
      </div>
      <div className="dash-row">
        <span>Yearly Projection</span>
        <strong className="green">₹{yearlySavings.toLocaleString("en-IN")}</strong>
      </div>
      {percent > 0 && (
        <div className="savings-badge-lg">
          🎯 {percent}% savings applied this month!
        </div>
      )}
    </div>
  );
};

export default SavingsCard;