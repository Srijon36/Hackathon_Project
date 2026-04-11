import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getBillAnalysis, compareBills, predictNextBill } from "../Reducer/AnalysisSlice";
import { getApplianceProfile } from "../Reducer/ApplianceSlice";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Cell, PieChart, Pie
} from "recharts";

const APPLIANCE_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"
];

// ── Smart Tips Engine ─────────────────────────────────────────────────────────
const generateTips = (bill, comparisonData) => {
  const tips = [];
  const units      = bill.unitsBilled    || 0;
  const netAmount  = bill.netAmount      || 0;
  const grossAmount= bill.grossAmount    || 0;
  const costPerUnit= units > 0 ? netAmount / units : 0;
  const rebate     = bill.rebate         || 0;
  const govtDuty   = bill.govtDuty       || 0;
  const fixedCharge= bill.fixedDemandCharges || 0;
  const loadKVA    = bill.loadKVA        || 0;
  const dailyUnits = units / 30;

  // ── 1. Payment Status ──────────────────────────────────────────────────────
  if (bill.paymentStatus === "Overdue") {
    tips.push({
      icon: "🚨", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", priority: 0,
      title: "Bill Overdue — Pay Immediately",
      detail: `Your ₹${netAmount.toLocaleString("en-IN")} bill is overdue. Late payment typically attracts a 1.5–2% surcharge per month — that's ₹${Math.round(netAmount * 0.02).toLocaleString("en-IN")} extra if unpaid this month.`,
    });
  }

  // ── 2. Cost per unit analysis ──────────────────────────────────────────────
  if (costPerUnit > 9) {
    tips.push({
      icon: "⚡", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", priority: 1,
      title: `High Cost Per Unit — ₹${costPerUnit.toFixed(2)}/kWh`,
      detail: `You're paying ₹${costPerUnit.toFixed(2)} per unit, which is above the average domestic rate of ₹7–8. This often happens due to exceeding slab limits. Reducing consumption by just 20 units could drop you to a lower slab and save ₹${Math.round(20 * (costPerUnit - 7)).toLocaleString("en-IN")}.`,
    });
  } else if (costPerUnit > 7) {
    tips.push({
      icon: "⚡", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", priority: 2,
      title: `Moderate Cost Per Unit — ₹${costPerUnit.toFixed(2)}/kWh`,
      detail: `Your per-unit rate of ₹${costPerUnit.toFixed(2)} is within normal range but approaching the higher slab. Watch your usage to avoid crossing the next threshold.`,
    });
  }

  // ── 3. Consumption level ───────────────────────────────────────────────────
  if (units > 500) {
    tips.push({
      icon: "🔴", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", priority: 1,
      title: `Very High Consumption — ${units} kWh`,
      detail: `At ${units} kWh (${dailyUnits.toFixed(1)} units/day), you're in the highest tariff slab. Reducing by 100 units could save approximately ₹${Math.round(100 * costPerUnit).toLocaleString("en-IN")}. AC and water heaters are the biggest culprits at this usage level.`,
    });
  } else if (units > 300) {
    tips.push({
      icon: "🟠", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", priority: 2,
      title: `High Consumption — ${units} kWh (${dailyUnits.toFixed(1)} units/day)`,
      detail: `You're using ${dailyUnits.toFixed(1)} units daily. Reducing AC usage by 1 hour/day saves ~1.5 kWh, which over a month is 45 kWh — worth ₹${Math.round(45 * costPerUnit).toLocaleString("en-IN")} at your current rate.`,
    });
  } else if (units < 50) {
    tips.push({
      icon: "🟢", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", priority: 3,
      title: `Low Consumption — ${units} kWh`,
      detail: `Your consumption is very efficient at ${units} kWh. Make sure you're not being overcharged — verify meter readings match your bill.`,
    });
  }

  // ── 4. Comparison with previous bill ──────────────────────────────────────
  if (comparisonData?.previousBill?.unitsBilled > 0) {
    const prevUnits  = comparisonData.previousBill.unitsBilled;
    const prevAmount = comparisonData.previousBill.netAmount;
    const unitChange = units - prevUnits;
    const amtChange  = netAmount - prevAmount;
    const unitPct    = Math.abs(Math.round((unitChange / prevUnits) * 100));

    if (unitChange > 0) {
      tips.push({
        icon: "📈", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", priority: 1,
        title: `Consumption Up ${unitPct}% vs Last Bill`,
        detail: `You used ${unitChange} more units than ${comparisonData.previousBill.billMonth} (${prevUnits} kWh → ${units} kWh), adding ₹${Math.abs(Math.round(amtChange)).toLocaleString("en-IN")} to your bill. Check if you added any new appliances or left AC/heater running overnight.`,
      });
    } else if (unitChange < 0) {
      tips.push({
        icon: "📉", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", priority: 3,
        title: `Great! Consumption Down ${unitPct}% vs Last Bill`,
        detail: `You saved ${Math.abs(unitChange)} units compared to ${comparisonData.previousBill.billMonth}, reducing your bill by ₹${Math.abs(Math.round(amtChange)).toLocaleString("en-IN")}. Keep up the good habits!`,
      });
    }
  }

  // ── 5. Rebate / savings analysis ───────────────────────────────────────────
  if (rebate > 0) {
    const rebatePct = grossAmount > 0 ? ((rebate / grossAmount) * 100).toFixed(1) : 0;
    tips.push({
      icon: "🎯", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", priority: 3,
      title: `You Saved ₹${rebate.toLocaleString("en-IN")} via Rebate (${rebatePct}%)`,
      detail: `A rebate of ₹${rebate.toLocaleString("en-IN")} was applied to your bill. This could be an early payment discount or a government subsidy. Pay before the due date each month to keep earning this rebate.`,
    });
  } else if (grossAmount > 0 && rebate === 0 && bill.paymentStatus !== "Overdue") {
    tips.push({
      icon: "💰", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", priority: 2,
      title: "You May Qualify for an Early Payment Rebate",
      detail: `No rebate was applied this month. Many DISCOMs offer 1–2% rebate for paying before the due date. On your ₹${grossAmount.toLocaleString("en-IN")} bill that's up to ₹${Math.round(grossAmount * 0.02).toLocaleString("en-IN")} savings.`,
    });
  }

  // ── 6. Fixed / demand charges ──────────────────────────────────────────────
  if (fixedCharge > 0 && units > 0) {
    const fixedPct = ((fixedCharge / netAmount) * 100).toFixed(1);
    if (parseFloat(fixedPct) > 20) {
      tips.push({
        icon: "📋", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", priority: 2,
        title: `Fixed Charges Are ${fixedPct}% of Your Bill`,
        detail: `Your fixed/demand charges of ₹${fixedCharge.toLocaleString("en-IN")} are a large portion of your bill. These are based on your sanctioned load of ${loadKVA} KVA. If you rarely use heavy appliances, apply to your DISCOM to reduce your sanctioned load — this can lower fixed charges permanently.`,
      });
    }
  }

  // ── 7. Load KVA analysis ───────────────────────────────────────────────────
  if (loadKVA > 10) {
    tips.push({
      icon: "🔌", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", priority: 2,
      title: `High Sanctioned Load — ${loadKVA} KVA`,
      detail: `Your connection has a ${loadKVA} KVA load. If your actual peak usage is lower, request a load reduction from your DISCOM. This directly reduces your fixed demand charges every month.`,
    });
  }

  // ── 8. Govt duty ──────────────────────────────────────────────────────────
  if (govtDuty > 150) {
    tips.push({
      icon: "🏛️", color: "#64748b", bg: "#f8fafc", border: "#e2e8f0", priority: 3,
      title: `Govt Duty — ₹${govtDuty.toLocaleString("en-IN")}`,
      detail: `You're paying ₹${govtDuty.toLocaleString("en-IN")} in government duty. Senior citizens and BPL households may be eligible for exemptions. Check with your DISCOM if you qualify for a reduced duty category.`,
    });
  }

  // ── 9. Daily usage insight ─────────────────────────────────────────────────
  if (units > 100) {
    tips.push({
      icon: "📊", color: "#06b6d4", bg: "#ecfeff", border: "#a5f3fc", priority: 3,
      title: `Daily Usage: ${dailyUnits.toFixed(1)} units/day = ₹${(dailyUnits * costPerUnit).toFixed(0)}/day`,
      detail: `You spend about ₹${(dailyUnits * costPerUnit).toFixed(0)} per day on electricity. Small changes like switching off standby devices (saves ~0.5 units/day) add up to ₹${Math.round(0.5 * costPerUnit * 30).toLocaleString("en-IN")}/month.`,
    });
  }

  // Sort by priority (lower = more urgent)
  return tips.sort((a, b) => a.priority - b.priority);
};

const calculateGenericBreakdown = (totalUnits, netAmount) => {
  if (!totalUnits || totalUnits === 0) return [];
  const costPerUnit = (netAmount || 0) / totalUnits;
  const appliances = [
    { name: "Air Conditioner", icon: "❄️", watt: 1500, hours: 8  },
    { name: "Refrigerator",    icon: "🧊", watt: 150,  hours: 24 },
    { name: "Television",      icon: "📺", watt: 100,  hours: 6  },
    { name: "Washing Machine", icon: "🫧", watt: 500,  hours: 1  },
    { name: "Fan",             icon: "🌀", watt: 75,   hours: 12 },
    { name: "LED Bulbs",       icon: "💡", watt: 40,   hours: 8  },
    { name: "Others",          icon: "🔌", watt: 200,  hours: 4  },
  ];
  const raw      = appliances.map((a) => ({ ...a, rawKwh: (a.watt * a.hours * 30) / 1000 }));
  const totalRaw = raw.reduce((s, a) => s + a.rawKwh, 0);
  return raw.map((a) => {
    const units   = parseFloat(((a.rawKwh / totalRaw) * totalUnits).toFixed(1));
    const percent = parseFloat(((a.rawKwh / totalRaw) * 100).toFixed(1));
    return { name: a.name, icon: a.icon, units, percent, cost: Math.round(units * costPerUnit) };
  });
};

const calculateRealBreakdown = (appliances, totalUnits, netAmount) => {
  if (!appliances?.length || !totalUnits || !netAmount) return [];
  const costPerUnit = netAmount / totalUnits;
  const raw = appliances.map((a) => ({
    ...a,
    rawKwh: (a.wattage * a.quantity * a.hoursPerDay * 30) / 1000,
  }));
  const totalRaw = raw.reduce((s, a) => s + a.rawKwh, 0);
  return raw.map((a) => {
    const units   = parseFloat(((a.rawKwh / totalRaw) * totalUnits).toFixed(1));
    const percent = parseFloat(((a.rawKwh / totalRaw) * 100).toFixed(1));
    const cost    = Math.round(units * costPerUnit);
    return { name: a.name, icon: a.icon || "🔌", units, percent, cost, qty: a.quantity, hrs: a.hoursPerDay };
  });
};

const TrendBadge = ({ trend, pct }) => {
  const config = {
    increasing: { color: "#ef4444", bg: "#fef2f2", border: "#fecaca", icon: "↑", label: "Increasing" },
    decreasing: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "↓", label: "Decreasing" },
    stable:     { color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "→", label: "Stable"     },
  };
  const c = config[trend] || config.stable;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.color, borderRadius: "99px",
      fontSize: "12px", fontWeight: 700,
      padding: "4px 10px",
    }}>
      {c.icon} {pct}% {c.label}
    </span>
  );
};

const PredictionCard = () => {
  const dispatch = useDispatch();
  const { prediction, predicting, predictionError, basedOn, generatedAt } =
    useSelector((s) => s.analysis);

  useEffect(() => {
    dispatch(predictNextBill());
  }, [dispatch]);

  const formattedTime = generatedAt
    ? new Date(generatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="chart-card" style={{ marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <h3 style={{ margin: 0 }}>🔮 Next Month Prediction</h3>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0 0" }}>
            AI-powered forecast based on your bill history
            {basedOn > 0 && (
              <span style={{
                marginLeft: "8px", background: "#eff6ff", color: "#1d4ed8",
                fontSize: "11px", fontWeight: 700, padding: "2px 8px",
                borderRadius: "99px", border: "1px solid #bfdbfe",
              }}>
                {basedOn} bill{basedOn > 1 ? "s" : ""} analysed
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <button
            onClick={() => dispatch(predictNextBill())}
            disabled={predicting}
            style={{
              background: "#f1f5f9", border: "1px solid #e2e8f0",
              borderRadius: "8px", padding: "6px 12px",
              fontSize: "13px", cursor: predicting ? "not-allowed" : "pointer",
              color: "#475569", opacity: predicting ? 0.5 : 1, fontFamily: "inherit",
            }}
          >
            {predicting ? "Loading…" : "⟳ Refresh"}
          </button>
          {formattedTime && (
            <span style={{ fontSize: "10px", color: "#cbd5e1" }}>Generated at {formattedTime}</span>
          )}
        </div>
      </div>

      {predicting && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 0", gap: "12px" }}>
          <div className="spinner" />
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>🤖 Claude is analysing your bill history…</p>
        </div>
      )}

      {predictionError && !predicting && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "16px", color: "#ef4444", fontSize: "14px", textAlign: "center" }}>
          <p style={{ margin: "0 0 10px 0" }}>⚠️ {predictionError}</p>
          <button onClick={() => dispatch(predictNextBill())} style={{ background: "#fff", border: "1px solid #fecaca", color: "#ef4444", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>
            Try Again
          </button>
        </div>
      )}

      {prediction && !predicting && (
        <>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Predicted Net Amount</p>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "2px" }}>
                <span style={{ fontSize: "22px", fontWeight: 700, color: "#3b82f6", marginTop: "6px" }}>₹</span>
                <span style={{ fontSize: "52px", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                  {prediction.predictedNetAmount?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <TrendBadge trend={prediction.trend} pct={prediction.trendPercentage} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            {[
              { label: "Units",          value: `${prediction.predictedUnits} kWh`,                               color: "#3b82f6" },
              { label: "Energy Charges", value: `₹${prediction.predictedEnergyCharges?.toLocaleString("en-IN")}`, color: "#f59e0b" },
              { label: "Gross Amount",   value: `₹${prediction.predictedGrossAmount?.toLocaleString("en-IN")}`,   color: "#8b5cf6" },
            ].map((item) => (
              <div key={item.label} style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 6px 0", textTransform: "uppercase" }}>{item.label}</p>
                <p style={{ fontSize: "15px", fontWeight: 700, color: item.color, margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>

          <div style={{ height: "1px", background: "#f1f5f9", margin: "0 0 16px 0" }} />

          <div style={{ marginBottom: "14px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px 0" }}>📊 Analysis</p>
            <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, margin: 0 }}>{prediction.reason}</p>
          </div>

          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "14px 16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px 0" }}>💡 Saving Tip</p>
            <p style={{ fontSize: "13px", color: "#15803d", lineHeight: 1.6, margin: 0 }}>{prediction.savingTip}</p>
          </div>
        </>
      )}
    </div>
  );
};

const AnalysisPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id }   = useParams();

  const { analysisData, comparisonData, loading, error } = useSelector((s) => s.analysis);
  const { profile } = useSelector((s) => s.appliance);

  useEffect(() => {
    if (id) {
      dispatch(getBillAnalysis(id));
      dispatch(compareBills());
    }
    dispatch(getApplianceProfile());
  }, [id, dispatch]);

  if (loading) return (
    <div className="loader-container">
      <div className="spinner" />
      <p style={{ marginTop: "12px", color: "#64748b" }}>🔍 Analysing your bill…</p>
    </div>
  );

  if (error) return (
    <div className="loader-container" style={{ flexDirection: "column", gap: "12px" }}>
      <p style={{ color: "#ef4444" }}>❌ {error}</p>
      <button className="nav-btn" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
    </div>
  );

  if (!analysisData) return (
    <div className="loader-container" style={{ flexDirection: "column", gap: "12px" }}>
      <p style={{ color: "#64748b" }}>No analysis data found.</p>
      <button className="nav-btn" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
    </div>
  );

  const bill = analysisData?.data || analysisData;

  const applianceData = profile?.appliances
    ? calculateRealBreakdown(profile.appliances, bill.unitsBilled, bill.netAmount)
    : calculateGenericBreakdown(bill.unitsBilled, bill.netAmount);

  const isRealData = !!profile?.appliances;

  const comparisonChartData = comparisonData ? [
    { name: "Previous Bill", Amount: comparisonData.previousBill?.netAmount   || 0, Units: comparisonData.previousBill?.unitsBilled || 0 },
    { name: "Current Bill",  Amount: comparisonData.currentBill?.netAmount    || 0, Units: comparisonData.currentBill?.unitsBilled  || 0 },
  ] : [];

  const saved   = (bill.grossAmount || 0) - (bill.netAmount || 0);
  const percent = bill.grossAmount > 0 ? Math.round((saved / bill.grossAmount) * 100) : 0;

  // ── Generate smart tips from real bill data ──────────────────────────────
  const tips = generateTips(bill, comparisonData);

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "14px", marginBottom: "8px", padding: 0 }}>
            ← Back to Dashboard
          </button>
          <h2>📊 Bill Analysis</h2>
          <p>{bill.customerName} · {bill.billMonth}</p>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi-card kpi-blue">
          <div className="kpi-label">Units Consumed</div>
          <div className="kpi-value kpi-val-blue">{bill.unitsBilled || 0}<span className="kpi-unit"> kWh</span></div>
        </div>
        <div className="kpi-card kpi-dark">
          <div className="kpi-label">Gross Amount</div>
          <div className="kpi-value kpi-val-dark">₹{(bill.grossAmount || 0).toLocaleString("en-IN")}</div>
        </div>
        <div className="kpi-card kpi-green">
          <div className="kpi-label">Net Amount</div>
          <div className="kpi-value kpi-val-green">₹{(bill.netAmount || 0).toLocaleString("en-IN")}</div>
        </div>
        <div className="kpi-card kpi-teal">
          <div className="kpi-label">Total Saved</div>
          <div className="kpi-value kpi-val-teal">₹{saved.toLocaleString("en-IN")}</div>
          <div className="kpi-badge up">{percent}% saved</div>
        </div>
      </div>

      <div className="charts-grid" style={{ marginTop: "24px" }}>
        <div className="chart-card">
          <h3>⚡ Appliance Cost Breakdown</h3>
          <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>
            {isRealData ? `Based on your ${profile.consumerType} appliance profile` : "Generic estimate — fill your appliance profile for accuracy"}
            {!isRealData && <a href="/appliances" style={{ color: "#22c55e", fontWeight: 700, marginLeft: "6px" }}>Fill now →</a>}
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={applianceData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="cost" paddingAngle={3}>
                {applianceData.map((_, index) => (
                  <Cell key={index} fill={APPLIANCE_COLORS[index % APPLIANCE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val, name) => [`₹${val.toLocaleString("en-IN")}`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: "16px" }}>
            {applianceData.map((item, index) => (
              <div key={item.name} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "18px" }}>{item.icon}</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>
                      {item.name}
                      {item.qty && <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "11px" }}> ({item.qty} unit{item.qty > 1 ? "s" : ""}, {item.hrs}hrs/day)</span>}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>₹{item.cost?.toLocaleString("en-IN")}</span>
                    <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "6px" }}>{item.units} kWh · {item.percent}%</span>
                  </div>
                </div>
                <div style={{ background: "#f1f5f9", borderRadius: "99px", height: "7px", overflow: "hidden" }}>
                  <div style={{ width: `${item.percent}%`, height: "7px", borderRadius: "99px", background: APPLIANCE_COLORS[index % APPLIANCE_COLORS.length], transition: "width 0.8s ease" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "16px", padding: "12px 16px", background: "#f0fdf4", borderRadius: "10px", border: "1px solid #86efac", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#15803d" }}>Total Bill Amount</span>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "#16a34a" }}>₹{(bill.netAmount || 0).toLocaleString("en-IN")}</span>
          </div>
        </div>

        {comparisonChartData.length > 0 && (
          <div className="chart-card">
            <h3>📊 vs Previous Bill</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Amount" fill="#3b82f6" name="Amount (₹)" />
                <Bar dataKey="Units"  fill="#10b981" name="Units (kWh)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <PredictionCard />

      <div className="chart-card" style={{ marginTop: "24px" }}>
        <h3>🧾 Full Bill Details</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[
            { label: "Consumer Number", value: bill.consumerNumber  || "N/A" },
            { label: "Customer Name",   value: bill.customerName    || "N/A" },
            { label: "Address",         value: bill.address         || "N/A" },
            { label: "Consumer Type",   value: bill.consumerType    || "N/A" },
            { label: "Bill Month",      value: bill.billMonth       || "N/A" },
            { label: "Bill Date",       value: bill.billDate ? new Date(bill.billDate).toLocaleDateString("en-IN") : "N/A" },
            { label: "Due Date",        value: bill.dueDate  ? new Date(bill.dueDate).toLocaleDateString("en-IN")  : "N/A" },
            { label: "Units Billed",    value: `${bill.unitsBilled || 0} kWh` },
            { label: "Energy Charges",  value: `₹${(bill.energyCharges      || 0).toLocaleString("en-IN")}` },
            { label: "Fixed Charges",   value: `₹${(bill.fixedDemandCharges || 0).toLocaleString("en-IN")}` },
            { label: "Govt Duty",       value: `₹${(bill.govtDuty           || 0).toLocaleString("en-IN")}` },
            { label: "Meter Rent",      value: `₹${(bill.meterRent          || 0).toLocaleString("en-IN")}` },
            { label: "Adjustments",     value: `₹${(bill.adjustments        || 0).toLocaleString("en-IN")}` },
            { label: "Rebate",          value: `₹${(bill.rebate             || 0).toLocaleString("en-IN")}` },
            { label: "Gross Amount",    value: `₹${(bill.grossAmount        || 0).toLocaleString("en-IN")}` },
            { label: "Net Amount",      value: `₹${(bill.netAmount          || 0).toLocaleString("en-IN")}` },
            { label: "Payment Status",  value: bill.paymentStatus   || "Pending" },
            { label: "Load (KVA)",      value: `${bill.loadKVA      || 0} KVA` },
          ].map((item) => (
            <div key={item.label} className="dash-row" style={{ padding: "10px 0" }}>
              <span style={{ color: "#64748b" }}>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* ── Smart Recommendations ─────────────────────────────────────────── */}
      <div className="chart-card" style={{ marginTop: "24px" }}>
        <h3>💡 Smart Recommendations</h3>
        <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "20px", marginTop: "4px" }}>
          Personalised insights based on your {bill.billMonth} bill data
        </p>

        {tips.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
            ✅ Your bill looks healthy — no major issues detected.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {tips.map((tip, i) => (
              <div key={i} style={{
                background: tip.bg,
                border: `1px solid ${tip.border}`,
                borderRadius: "12px",
                padding: "16px 18px",
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
              }}>
                <span style={{ fontSize: "22px", flexShrink: 0, marginTop: "1px" }}>{tip.icon}</span>
                <div>
                  <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: 700, color: tip.color }}>
                    {tip.title}
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
                    {tip.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;