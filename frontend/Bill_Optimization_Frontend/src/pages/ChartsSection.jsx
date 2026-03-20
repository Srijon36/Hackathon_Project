import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

// ── Bar Chart — Monthly Usage ──────────────────
const MonthlyUsageChart = ({ bills }) => {
  const data = bills.slice(-6).map((bill) => ({
    month: bill.billMonth || "N/A",
    Units: bill.unitsBilled || 0,
    Amount: bill.netAmount || 0,
  }));

  return (
    <div className="chart-card">
      <h3>📊 Monthly Usage & Amount</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left"  dataKey="Units"  fill="#3b82f6" name="Units (kWh)" />
          <Bar yAxisId="right" dataKey="Amount" fill="#10b981" name="Amount (₹)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── Pie Chart — Cost Breakdown ─────────────────
const CostBreakdownChart = ({ bill }) => {
  const data = [
    { name: "Energy Charges",   value: bill.energyCharges      || 0 },
    { name: "Fixed Charges",    value: bill.fixedDemandCharges || 0 },
    { name: "Govt Duty",        value: bill.govtDuty           || 0 },
    { name: "Meter Rent",       value: bill.meterRent          || 0 },
    { name: "Adjustments",      value: Math.abs(bill.adjustments || 0) },
  ].filter((d) => d.value > 0);

  if (data.length === 0) return (
    <div className="chart-card">
      <h3>🥧 Cost Breakdown</h3>
      <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>
        No breakdown data available
      </p>
    </div>
  );

  return (
    <div className="chart-card">
      <h3>🥧 Cost Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(val) => `₹${val.toLocaleString("en-IN")}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── Line Chart — Year over Year ────────────────
const YearOverYearChart = ({ bills }) => {
  const data = bills.map((bill) => ({
    month:  bill.billMonth || "N/A",
    Amount: bill.netAmount  || 0,
    Units:  bill.unitsBilled || 0,
  }));

  return (
    <div className="chart-card">
      <h3>📈 Usage Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="Amount"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Amount (₹)"
          />
          <Line
            type="monotone"
            dataKey="Units"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Units (kWh)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── Prediction Card ────────────────────────────
const PredictionCard = ({ bills }) => {
  if (bills.length < 2) return null;

  // Simple average of last 3 bills
  const last3 = bills.slice(-3);
  const avgUnits  = Math.round(last3.reduce((s, b) => s + (b.unitsBilled || 0), 0) / last3.length);
  const avgAmount = Math.round(last3.reduce((s, b) => s + (b.netAmount   || 0), 0) / last3.length);

  // Trend — compare last bill vs average
  const lastBill = bills[bills.length - 1];
  const trend = lastBill.unitsBilled > avgUnits ? "📈 Higher" : "📉 Lower";
  const trendColor = lastBill.unitsBilled > avgUnits ? "#ef4444" : "#10b981";

  return (
    <div className="chart-card prediction-card">
      <h3>🔮 Next Month Prediction</h3>
      <p style={{ color: "#64748b", marginBottom: "16px" }}>
        Based on your last 3 bills average
      </p>
      <div className="kpi-row" style={{ gap: "12px" }}>
        <div className="kpi-card">
          <div className="kpi-label">Predicted Units</div>
          <div className="kpi-value blue">{avgUnits} <span style={{ fontSize: "14px" }}>kWh</span></div>
          <div className="kpi-badge" style={{ color: trendColor }}>{trend} than avg</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Predicted Amount</div>
          <div className="kpi-value">₹{avgAmount.toLocaleString("en-IN")}</div>
          <div className="kpi-badge up">Estimated</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Bills Analysed</div>
          <div className="kpi-value green">{bills.length}</div>
          <div className="kpi-badge up">Total bills</div>
        </div>
      </div>
    </div>
  );
};

// ── MAIN EXPORT ────────────────────────────────
const ChartsSection = ({ bills }) => {
  if (!bills || bills.length === 0) return null;

  const latestBill = bills[bills.length - 1];

  return (
    <div className="charts-section">
      <PredictionCard bills={bills} />
      <MonthlyUsageChart bills={bills} />
      <div className="charts-grid">
        <CostBreakdownChart bill={latestBill} />
        <YearOverYearChart bills={bills} />
      </div>
    </div>
  );
};

export default ChartsSection;