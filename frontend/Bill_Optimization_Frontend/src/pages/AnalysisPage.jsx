import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getBillAnalysis, compareBills } from "../Reducer/AnalysisSlice";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, BarChart,
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

const AnalysisPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { id }    = useParams();

  const { analysisData, comparisonData, loading, error } = useSelector(
    (state) => state.analysis
  );

  useEffect(() => {
    if (id) {
      dispatch(getBillAnalysis(id));
      dispatch(compareBills());
    }
  }, [id, dispatch]);

  if (loading) return (
    <div className="loader-container">
      <div className="spinner" />
      <p style={{ marginTop: "12px", color: "#64748b" }}>
        🔍 Analysing your bill...
      </p>
    </div>
  );

  if (error) return (
    <div className="loader-container">
      <p style={{ color: "#ef4444" }}>❌ {error}</p>
      <button className="nav-btn" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>
    </div>
  );

  if (!analysisData) return (
    <div className="loader-container">
      <p style={{ color: "#64748b" }}>No analysis data found.</p>
      <button className="nav-btn" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>
    </div>
  );

  const bill = analysisData?.data || analysisData;

  // ✅ Cost breakdown for radar chart
  const radarData = [
    { subject: "Energy",   value: bill.energyCharges      || 0 },
    { subject: "Fixed",    value: bill.fixedDemandCharges || 0 },
    { subject: "Govt Duty",value: bill.govtDuty           || 0 },
    { subject: "Meter",    value: bill.meterRent          || 0 },
    { subject: "Rebate",   value: bill.rebate             || 0 },
  ];

  // ✅ Comparison chart data
  const comparisonChartData = comparisonData ? [
    {
      name:     "Previous Bill",
      Amount:   comparisonData.previousBill?.netAmount  || 0,
      Units:    comparisonData.previousBill?.unitsBilled || 0,
    },
    {
      name:     "Current Bill",
      Amount:   comparisonData.currentBill?.netAmount   || 0,
      Units:    comparisonData.currentBill?.unitsBilled  || 0,
    },
  ] : [];

  const saved   = (bill.grossAmount || 0) - (bill.netAmount || 0);
  const percent = bill.grossAmount > 0
    ? Math.round((saved / bill.grossAmount) * 100)
    : 0;

  return (
    <div className="dash-page">

      {/* ── Header ───────────────────────────── */}
      <div className="dash-header">
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "none", border: "none",
              color: "#3b82f6", cursor: "pointer",
              fontSize: "14px", marginBottom: "8px",
              padding: 0,
            }}
          >
            ← Back to Dashboard
          </button>
          <h2>📊 Bill Analysis</h2>
          <p>{bill.customerName} · {bill.billMonth}</p>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────── */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-label">Units Consumed</div>
          <div className="kpi-value blue">
            {bill.unitsBilled || 0}
            <span style={{ fontSize: "14px", color: "#94a3b8" }}> kWh</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Gross Amount</div>
          <div className="kpi-value">
            ₹{(bill.grossAmount || 0).toLocaleString("en-IN")}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Net Amount</div>
          <div className="kpi-value blue">
            ₹{(bill.netAmount || 0).toLocaleString("en-IN")}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Saved</div>
          <div className="kpi-value green">
            ₹{saved.toLocaleString("en-IN")}
          </div>
          <div className="kpi-badge up">{percent}% saved</div>
        </div>
      </div>

      {/* ── Charts Row ───────────────────────── */}
      <div className="charts-grid" style={{ marginTop: "24px" }}>

        {/* Radar Chart */}
        <div className="chart-card">
          <h3>🕸 Charge Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.4}
              />
              <Tooltip formatter={(val) => `₹${val.toLocaleString("en-IN")}`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Chart */}
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

      {/* ── Bill Details ──────────────────────── */}
      <div className="chart-card" style={{ marginTop: "24px" }}>
        <h3>🧾 Full Bill Details</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[
            { label: "Consumer Number",  value: bill.consumerNumber  || "N/A" },
            { label: "Customer Name",    value: bill.customerName    || "N/A" },
            { label: "Address",          value: bill.address         || "N/A" },
            { label: "Consumer Type",    value: bill.consumerType    || "N/A" },
            { label: "Bill Month",       value: bill.billMonth       || "N/A" },
            { label: "Bill Date",        value: bill.billDate ? new Date(bill.billDate).toLocaleDateString("en-IN") : "N/A" },
            { label: "Due Date",         value: bill.dueDate  ? new Date(bill.dueDate).toLocaleDateString("en-IN")  : "N/A" },
            { label: "Units Billed",     value: `${bill.unitsBilled || 0} kWh` },
            { label: "Energy Charges",   value: `₹${(bill.energyCharges      || 0).toLocaleString("en-IN")}` },
            { label: "Fixed Charges",    value: `₹${(bill.fixedDemandCharges || 0).toLocaleString("en-IN")}` },
            { label: "Govt Duty",        value: `₹${(bill.govtDuty           || 0).toLocaleString("en-IN")}` },
            { label: "Meter Rent",       value: `₹${(bill.meterRent          || 0).toLocaleString("en-IN")}` },
            { label: "Adjustments",      value: `₹${(bill.adjustments        || 0).toLocaleString("en-IN")}` },
            { label: "Rebate",           value: `₹${(bill.rebate             || 0).toLocaleString("en-IN")}` },
            { label: "Gross Amount",     value: `₹${(bill.grossAmount        || 0).toLocaleString("en-IN")}` },
            { label: "Net Amount",       value: `₹${(bill.netAmount          || 0).toLocaleString("en-IN")}` },
            { label: "Payment Status",   value: bill.paymentStatus   || "Pending" },
            { label: "Load (KVA)",       value: `${bill.loadKVA      || 0} KVA` },
          ].map((item) => (
            <div
              key={item.label}
              className="dash-row"
              style={{ padding: "10px 0" }}
            >
              <span style={{ color: "#64748b" }}>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recommendations ───────────────────── */}
      <div className="chart-card" style={{ marginTop: "24px" }}>
        <h3>💡 Smart Recommendations</h3>
        <ul className="tips-list">
          {(bill.unitsBilled || 0) > 300 && (
            <li className="tip-item">
              <span className="tip-dot" />
              ⚡ High usage detected — consider reducing AC usage
            </li>
          )}
          {(bill.energyCharges || 0) > 1000 && (
            <li className="tip-item">
              <span className="tip-dot" />
              💡 Switch to LED bulbs to reduce energy charges
            </li>
          )}
          {bill.paymentStatus === "Overdue" && (
            <li className="tip-item">
              <span className="tip-dot" />
              ⚠️ Bill is overdue — pay immediately to avoid penalties
            </li>
          )}
          {(bill.loadKVA || 0) > 5 && (
            <li className="tip-item">
              <span className="tip-dot" />
              🔌 High load detected — unplug unused devices
            </li>
          )}
          {(bill.govtDuty || 0) > 100 && (
            <li className="tip-item">
              <span className="tip-dot" />
              🏛️ Check if you qualify for govt duty subsidies
            </li>
          )}
          <li className="tip-item">
            <span className="tip-dot" />
            🌡️ Set AC to 24°C instead of 18°C to save up to 20%
          </li>
          <li className="tip-item">
            <span className="tip-dot" />
            🌙 Use heavy appliances during off-peak hours
          </li>
        </ul>
      </div>

    </div>
  );
};

export default AnalysisPage;