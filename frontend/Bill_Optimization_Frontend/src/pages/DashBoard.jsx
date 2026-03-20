import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { getAllBills } from "../Reducer/BillSlice";
import { useNavigate } from "react-router-dom";
import BillSummary      from "./BillSummary";
import SavingsCard      from "./SavingsCard";
import UsageInsights    from "./UsageInsights";
import DownloadReport   from "./DownloadReport";
import SavingsTracker   from "./SavingsTracker";
import ChartsSection    from "./ChartsSection";
import BillHistoryTable from "./BillHistoryTable";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bills, loading, error } = useSelector((state) => state.bill);

  useEffect(() => {
    dispatch(getAllBills());
  }, [dispatch]);

  const data = bills && bills.length > 0 ? bills[bills.length - 1] : null;

  const netAmount     = data?.netAmount     || 0;
  const grossAmount   = data?.grossAmount   || 0;
  const unitsBilled   = data?.unitsBilled   || 0;
  const energyCharges = data?.energyCharges || 0;
  const saved         = grossAmount - netAmount;
  const percent       = grossAmount > 0 ? Math.round((saved / grossAmount) * 100) : 0;
  const yearlySavings = saved * 12;
  const costPerUnit   = unitsBilled > 0 ? (energyCharges / unitsBilled).toFixed(2) : 0;

  if (loading) return (
    <div className="loader-container">
      <div className="spinner" />
    </div>
  );

  if (error) return (
    <div className="dash-empty">
      <div className="dash-empty-icon">❌</div>
      <h3>Something went wrong</h3>
      <p>{error}</p>
      <button className="dash-upload-btn" onClick={() => dispatch(getAllBills())}>
        Try Again
      </button>
    </div>
  );

  if (!data) return (
    <div className="dash-empty">
      <div className="dash-empty-icon">📂</div>
      <h3>No Bills Found</h3>
      <p>Upload your first electricity bill to get AI-powered insights.</p>
      <button className="dash-upload-btn-lg" onClick={() => navigate("/upload")}>
        ⚡ Upload Your First Bill
      </button>
    </div>
  );

  return (
    <div className="dash-page">

      {/* ── Header ───────────────────────────── */}
      <div className="dash-header">
        <div>
          <h2>Dashboard</h2>
          <p>
            Welcome back, <strong>{data.customerName}</strong>
            &nbsp;·&nbsp;
            {data.billMonth}
          </p>
        </div>
        <div className="dash-header-btns">
          <DownloadReport data={data} />
          <button className="dash-upload-btn" onClick={() => navigate("/upload")}>
            ⚡ Upload New Bill
          </button>
        </div>
      </div>

      {/* ── Info Bar ─────────────────────────── */}
      <div className="info-bar">
        <span>📅 {data.billMonth}</span>
        <span>
          📆 Due:{" "}
          {data.dueDate
            ? new Date(data.dueDate).toLocaleDateString("en-IN")
            : "N/A"}
        </span>
        <span>🏠 {data.consumerType}</span>
        <span>🔢 {data.consumerNumber}</span>
      </div>

      {/* ── KPI Row ──────────────────────────── */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-icon">⚡</div>
          <div className="kpi-label">Units Consumed</div>
          <div className="kpi-value blue">
            {unitsBilled} <span className="kpi-unit">kWh</span>
          </div>
          <div className="kpi-badge neutral">₹{costPerUnit}/unit</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">💳</div>
          <div className="kpi-label">Total Bill</div>
          <div className="kpi-value">₹{netAmount.toLocaleString("en-IN")}</div>
          <div className="kpi-badge down">
            Gross: ₹{grossAmount.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">💰</div>
          <div className="kpi-label">Rebate Savings</div>
          <div className="kpi-value green">₹{saved.toLocaleString("en-IN")}</div>
          <div className="kpi-badge up">{percent}% saved</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">📈</div>
          <div className="kpi-label">Yearly Projection</div>
          <div className="kpi-value green">
            ₹{yearlySavings.toLocaleString("en-IN")}
          </div>
          <div className="kpi-badge up">Based on this bill</div>
        </div>
      </div>

      {/* ── Sub Cards ────────────────────────── */}
      <div className="dash-grid">
        <BillSummary   data={data} />
        <SavingsCard   data={data} />
        <UsageInsights data={data} />
      </div>

      {/* ── Bill Breakdown ────────────────────── */}
      <div className="dash-chart-card">
        <h3>🧾 Bill Breakdown</h3>
        {[
          { label: "Energy Charges",       value: data.energyCharges,      color: "#3b82f6" },
          { label: "Fixed/Demand Charges", value: data.fixedDemandCharges, color: "#8b5cf6" },
          { label: "Govt Duty",            value: data.govtDuty,           color: "#f59e0b" },
          { label: "Meter Rent",           value: data.meterRent,          color: "#10b981" },
          { label: "Adjustments",          value: data.adjustments,        color: "#6366f1" },
          { label: "Rebate",               value: data.rebate,             color: "#ef4444" },
        ].map((item) => (
          <div className="bar-row" key={item.label}>
            <span className="bar-label">{item.label}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: grossAmount > 0
                    ? `${Math.min(((item.value || 0) / grossAmount) * 100, 100)}%`
                    : "0%",
                  background: item.color,
                }}
              />
            </div>
            <span className="bar-val">
              ₹{(item.value || 0).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>

      {/* ── Payment Info ──────────────────────── */}
      <div className="dash-chart-card">
        <h3>💳 Payment Info</h3>
        <div className="payment-grid">
          <div className="payment-item">
            <span className="payment-label">Status</span>
            <span className={`payment-status ${data.paymentStatus?.toLowerCase()}`}>
              {data.paymentStatus === "Paid"    ? "✅" :
               data.paymentStatus === "Overdue" ? "❌" : "⏳"}{" "}
              {data.paymentStatus}
            </span>
          </div>
          {data.paymentMode && (
            <div className="payment-item">
              <span className="payment-label">Mode</span>
              <span className="payment-value">{data.paymentMode}</span>
            </div>
          )}
          {data.lastPaymentDate && (
            <div className="payment-item">
              <span className="payment-label">Last Paid</span>
              <span className="payment-value">
                {new Date(data.lastPaymentDate).toLocaleDateString("en-IN")}
              </span>
            </div>
          )}
          {data.securityDeposit > 0 && (
            <div className="payment-item">
              <span className="payment-label">Security Deposit</span>
              <span className="payment-value">₹{data.securityDeposit}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Charts Section ────────────────────── */}
      <ChartsSection bills={bills} />

      {/* ── Savings Tracker ───────────────────── */}
      <SavingsTracker bills={bills} />

      {/* ── Bill History Table ────────────────── */}
      <BillHistoryTable bills={bills} />

    </div>
  );
};

export default Dashboard;