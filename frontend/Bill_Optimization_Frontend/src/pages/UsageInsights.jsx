const UsageInsights = ({ data }) => {
  // ✅ generate tips based on real DB data
  const tips = [];

  if (data?.unitsBilled > 300)
    tips.push("⚡ High usage detected — consider reducing AC usage");

  if (data?.energyCharges > 1000)
    tips.push("💡 Switch to LED bulbs to reduce energy charges");

  if (data?.paymentStatus === "Overdue")
    tips.push("⚠️ Your bill is overdue — pay immediately to avoid penalties");

  if (data?.consumerType === "Domestic" && data?.unitsBilled > 200)
    tips.push("🌡️ Set AC temperature to 24°C instead of 18°C");

  if (data?.loadKVA > 5)
    tips.push("🔌 High load detected — unplug unused devices");

  if (data?.meterRent > 0)
    tips.push("📟 Consider buying your own meter to avoid rental charges");

  if (data?.govtDuty > 100)
    tips.push("🏛️ Govt duty is high — check if you qualify for subsidies");

  // fallback if no tips generated
  if (tips.length === 0)
    tips.push("✅ Your usage looks healthy! Keep it up.");

  return (
    <div className="dash-card">
      <h3>💡 Smart Recommendations</h3>

      {/* ✅ usage stats */}
      <div className="dash-row">
        <span>Units Billed</span>
        <strong>{data?.unitsBilled || 0} kWh</strong>
      </div>
      <div className="dash-row">
        <span>Consumer Type</span>
        <strong>{data?.consumerType || "N/A"}</strong>
      </div>
      <div className="dash-row">
        <span>Load</span>
        <strong>{data?.loadKVA || 0} KVA</strong>
      </div>

      {/* ✅ dynamic tips */}
      <ul className="tips-list" style={{ marginTop: "12px" }}>
        {tips.map((tip, i) => (
          <li key={i} className="tip-item">
            <span className="tip-dot" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsageInsights;