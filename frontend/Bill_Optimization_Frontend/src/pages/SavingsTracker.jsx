import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const SavingsTracker = ({ bills }) => {
  const stats = useMemo(() => {
    if (!bills || bills.length === 0) return null;

    // ✅ Total spent
    const totalSpent = bills.reduce((s, b) => s + (b.netAmount || 0), 0);

    // ✅ Total saved (gross - net = rebate savings)
    const totalSaved = bills.reduce(
      (s, b) => s + ((b.grossAmount || 0) - (b.netAmount || 0)), 0
    );

    // ✅ Total units consumed
    const totalUnits = bills.reduce((s, b) => s + (b.unitsBilled || 0), 0);

    // ✅ Average monthly bill
    const avgMonthly = Math.round(totalSpent / bills.length);

    // ✅ Highest bill
    const highestBill = bills.reduce(
      (max, b) => (b.netAmount > max.netAmount ? b : max), bills[0]
    );

    // ✅ Lowest bill
    const lowestBill = bills.reduce(
      (min, b) => (b.netAmount < min.netAmount ? b : min), bills[0]
    );

    // ✅ Cumulative savings chart data
    let cumulative = 0;
    const chartData = bills.map((b) => {
      cumulative += (b.grossAmount || 0) - (b.netAmount || 0);
      return {
        month:           b.billMonth || "N/A",
        "Monthly Saved": (b.grossAmount || 0) - (b.netAmount || 0),
        "Total Saved":   cumulative,
      };
    });

    // ✅ Paid vs Pending vs Overdue
    const paid    = bills.filter((b) => b.paymentStatus === "Paid").length;
    const pending = bills.filter((b) => b.paymentStatus === "Pending").length;
    const overdue = bills.filter((b) => b.paymentStatus === "Overdue").length;

    return {
      totalSpent,
      totalSaved,
      totalUnits,
      avgMonthly,
      highestBill,
      lowestBill,
      chartData,
      paid,
      pending,
      overdue,
      totalBills: bills.length,
    };
  }, [bills]);

  if (!stats) return null;

  return (
    <div style={{ marginTop: "24px" }}>
      <div className="chart-card">
        <h3>💰 Savings Tracker</h3>
        <p style={{ color: "#64748b", marginBottom: "20px", fontSize: "14px" }}>
          Track your total savings and spending since you joined
        </p>

        {/* ── KPI Row ──────────────────────────── */}
        <div className="kpi-row" style={{ marginBottom: "24px" }}>

          <div className="kpi-card">
            <div className="kpi-label">Total Spent</div>
            <div className="kpi-value">
              ₹{stats.totalSpent.toLocaleString("en-IN")}
            </div>
            <div className="kpi-badge down">All bills combined</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Total Saved</div>
            <div className="kpi-value green">
              ₹{stats.totalSaved.toLocaleString("en-IN")}
            </div>
            <div className="kpi-badge up">Via rebates</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Avg Monthly Bill</div>
            <div className="kpi-value blue">
              ₹{stats.avgMonthly.toLocaleString("en-IN")}
            </div>
            <div className="kpi-badge">Per month</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Total Units Used</div>
            <div className="kpi-value">
              {stats.totalUnits.toLocaleString("en-IN")}
              <span style={{ fontSize: "14px", color: "#94a3b8" }}> kWh</span>
            </div>
            <div className="kpi-badge">Since joining</div>
          </div>

        </div>

        {/* ── Cumulative Savings Chart ──────────── */}
        <h4 style={{ marginBottom: "12px", color: "#1e293b" }}>
          📈 Cumulative Savings Over Time
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={stats.chartData}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(val) => `₹${val.toLocaleString("en-IN")}`} />
            <Area
              type="monotone"
              dataKey="Total Saved"
              stroke="#10b981"
              fill="url(#savingsGrad)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="Monthly Saved"
              stroke="#3b82f6"
              fill="none"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* ── Best & Worst Bills ────────────────── */}
        <div className="charts-grid" style={{ marginTop: "24px" }}>

          <div style={{
            background: "#f0fdf4",
            borderRadius: "12px",
            padding: "16px",
            border: "1px solid #bbf7d0"
          }}>
            <h4 style={{ color: "#10b981", marginBottom: "12px" }}>
              🏆 Lowest Bill
            </h4>
            <div className="dash-row">
              <span>Month</span>
              <strong>{stats.lowestBill.billMonth || "N/A"}</strong>
            </div>
            <div className="dash-row">
              <span>Amount</span>
              <strong className="green">
                ₹{(stats.lowestBill.netAmount || 0).toLocaleString("en-IN")}
              </strong>
            </div>
            <div className="dash-row">
              <span>Units</span>
              <strong>{stats.lowestBill.unitsBilled || 0} kWh</strong>
            </div>
          </div>

          <div style={{
            background: "#fef2f2",
            borderRadius: "12px",
            padding: "16px",
            border: "1px solid #fecaca"
          }}>
            <h4 style={{ color: "#ef4444", marginBottom: "12px" }}>
              ⚠️ Highest Bill
            </h4>
            <div className="dash-row">
              <span>Month</span>
              <strong>{stats.highestBill.billMonth || "N/A"}</strong>
            </div>
            <div className="dash-row">
              <span>Amount</span>
              <strong style={{ color: "#ef4444" }}>
                ₹{(stats.highestBill.netAmount || 0).toLocaleString("en-IN")}
              </strong>
            </div>
            <div className="dash-row">
              <span>Units</span>
              <strong>{stats.highestBill.unitsBilled || 0} kWh</strong>
            </div>
          </div>

        </div>

        {/* ── Payment Stats ─────────────────────── */}
        <div style={{
          marginTop: "24px",
          background: "#f8fafc",
          borderRadius: "12px",
          padding: "16px",
        }}>
          <h4 style={{ marginBottom: "12px", color: "#1e293b" }}>
            💳 Payment Summary
          </h4>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>

            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#10b981" }}>
                {stats.paid}
              </div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>Paid</div>
            </div>

            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#f59e0b" }}>
                {stats.pending}
              </div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>Pending</div>
            </div>

            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#ef4444" }}>
                {stats.overdue}
              </div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>Overdue</div>
            </div>

            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#3b82f6" }}>
                {stats.totalBills}
              </div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>Total Bills</div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SavingsTracker;