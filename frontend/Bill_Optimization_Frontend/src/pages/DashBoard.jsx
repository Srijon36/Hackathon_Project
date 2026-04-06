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

/* ─── SVG Icon primitives ─────────────────────────────────── */
const Bolt = () => (
  <svg className="kpi-svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const CardIcon = () => (
  <svg className="kpi-svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const Rupee = () => (
  <svg className="kpi-svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12M6 8h12M6 13h5c3 0 5-2 5-5"/>
    <path d="M6 13l6 8"/>
  </svg>
);
const TrendUp = () => (
  <svg className="kpi-svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);
const UserIcon = (p) => (
  <svg width={p.s||13} height={p.s||13} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const HashIcon = (p) => (
  <svg width={p.s||13} height={p.s||13} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4"  y1="9"  x2="20" y2="9"/>
    <line x1="4"  y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3"  x2="8"  y2="21"/>
    <line x1="16" y1="3"  x2="14" y2="21"/>
  </svg>
);
const CalIcon = (p) => (
  <svg width={p.s||13} height={p.s||13} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
);
const HomeIcon = (p) => (
  <svg width={p.s||13} height={p.s||13} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const UploadIcon = (p) => (
  <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const DownloadIcon = (p) => (
  <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const FileIcon = (p) => (
  <svg width={p.s||13} height={p.s||13} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const CheckIcon = (p) => (
  <svg width={p.s||13} height={p.s||13} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = (p) => (
  <svg width={p.s||13} height={p.s||13} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6"  y1="6" x2="18" y2="18"/>
  </svg>
);
const ClockIcon = (p) => (
  <svg width={p.s||13} height={p.s||13} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

/* ─── Dashboard ─────────────────────────────────────────── */
const Dashboard = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { bills, loading, error } = useSelector((s) => s.bill);

  useEffect(() => { dispatch(getAllBills()); }, [dispatch]);

  const data          = bills?.length > 0 ? bills[bills.length - 1] : null;
  const netAmount     = data?.netAmount     || 0;
  const grossAmount   = data?.grossAmount   || 0;
  const unitsBilled   = data?.unitsBilled   || 0;
  const energyCharges = data?.energyCharges || 0;
  const saved         = grossAmount - netAmount;
  const percent       = grossAmount > 0 ? Math.round((saved / grossAmount) * 100) : 0;
  const yearlySavings = saved * 12;
  const costPerUnit   = unitsBilled > 0 ? (energyCharges / unitsBilled).toFixed(2) : 0;

  /* ── Loading ── */
  if (loading) return (
    <div className="loader-container"><div className="spinner" /></div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="dash-empty">
      <div className="dash-empty-icon-wrap error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h3>Something went wrong</h3>
      <p>{error}</p>
      <button className="dash-upload-btn" onClick={() => dispatch(getAllBills())}>
        Try Again
      </button>
    </div>
  );

  /* ── Empty ── */
  if (!data) return (
    <div className="dash-empty">
      <div className="dash-empty-icon-wrap">
        <FileIcon s={36} />
      </div>
      <h3>No Bills Found</h3>
      <p>Upload your first electricity bill to get AI-powered insights.</p>
      <button className="dash-upload-btn-lg" onClick={() => navigate("/upload")}>
        <UploadIcon /> Upload Your First Bill
      </button>
    </div>
  );

  const breakdown = [
    { label: "Energy Charges",        value: data.energyCharges,      color: "#3b82f6" },
    { label: "Fixed / Demand Charges", value: data.fixedDemandCharges, color: "#8b5cf6" },
    { label: "Govt Duty",              value: data.govtDuty,           color: "#f59e0b" },
    { label: "Meter Rent",             value: data.meterRent,          color: "#10b981" },
    { label: "Adjustments",            value: data.adjustments,        color: "#6366f1" },
    { label: "Rebate",                 value: data.rebate,             color: "#ef4444" },
  ];

  const statusIcon =
    data.paymentStatus === "Paid"    ? <CheckIcon /> :
    data.paymentStatus === "Overdue" ? <XIcon />     : <ClockIcon />;

  return (
    <div className="dash-page">

      {/* ── Header ─────────────────────────────────── */}
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Dashboard</h2>
          <div className="dash-meta">
            <span className="meta-item"><UserIcon /> Welcome back, <strong>{data.customerName}</strong></span>
            <span className="meta-sep" />
            <span className="meta-item"><HashIcon /> Customer ID: <strong>{data.consumerNumber}</strong></span>
            <span className="meta-sep" />
            <span className="meta-item"><CalIcon /> Date: <strong>{data.billMonth}</strong></span>
          </div>
        </div>
        <div className="dash-header-btns">
          <DownloadReport data={data} />
          <button className="dash-upload-btn" onClick={() => navigate("/upload")}>
            <UploadIcon /> Upload New Bill
          </button>
        </div>
      </div>

      {/* ── Info Bar ───────────────────────────────── */}
      <div className="info-bar">
        <span className="info-bar-item"><span className="info-dot"/><CalIcon />{data.billMonth}</span>
        <span className="info-bar-item">
          <span className="info-dot"/><CalIcon /> Due:{" "}
          {data.dueDate ? new Date(data.dueDate).toLocaleDateString("en-IN") : "N/A"}
        </span>
        <span className="info-bar-item"><span className="info-dot"/><HomeIcon />{data.consumerType}</span>
        <span className="info-bar-item"><span className="info-dot"/><HashIcon />{data.consumerNumber}</span>
      </div>

      {/* ── KPI Row ────────────────────────────────── */}
      <div className="kpi-row">

        <div className="kpi-card kpi-blue">
          <div className="kpi-icon-box kpi-icon-blue"><Bolt /></div>
          <div className="kpi-label">Units Consumed</div>
          <div className="kpi-value kpi-val-blue">
            {unitsBilled} <span className="kpi-unit">kWh</span>
          </div>
          <span className="kpi-badge neutral">&#8377;{costPerUnit}/unit</span>
        </div>

        <div className="kpi-card kpi-dark">
          <div className="kpi-icon-box kpi-icon-dark"><CardIcon /></div>
          <div className="kpi-label">Total Bill</div>
          <div className="kpi-value kpi-val-dark">
            &#8377;{netAmount.toLocaleString("en-IN")}
          </div>
          <span className="kpi-badge warn">
            Gross &#8377;{grossAmount.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="kpi-card kpi-green">
          <div className="kpi-icon-box kpi-icon-green"><Rupee /></div>
          <div className="kpi-label">Rebate Savings</div>
          <div className="kpi-value kpi-val-green">
            &#8377;{saved.toLocaleString("en-IN")}
          </div>
          <span className="kpi-badge up">+{percent}% saved</span>
        </div>

        <div className="kpi-card kpi-teal">
          <div className="kpi-icon-box kpi-icon-teal"><TrendUp /></div>
          <div className="kpi-label">Yearly Projection</div>
          <div className="kpi-value kpi-val-teal">
            &#8377;{yearlySavings.toLocaleString("en-IN")}
          </div>
          <span className="kpi-badge up">Based on this bill</span>
        </div>

      </div>

      {/* ── Sub Cards ──────────────────────────────── */}
      <div className="dash-grid">
        <BillSummary   data={data} />
        <SavingsCard   data={data} />
        <UsageInsights data={data} />
      </div>

      {/* ── Bill Breakdown ─────────────────────────── */}
      <div className="dash-chart-card">
        <h3 className="card-section-title">
          <span className="title-icon-wrap blue-icon"><FileIcon s={13} /></span>
          Bill Breakdown
        </h3>
        {breakdown.map((item) => (
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
              &#8377;{(item.value || 0).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>

      {/* ── Payment Info ───────────────────────────── */}
      <div className="dash-chart-card">
        <h3 className="card-section-title">
          <span className="title-icon-wrap green-icon"><CardIcon /></span>
          Payment Info
        </h3>
        <div className="payment-grid">
          <div className="payment-item">
            <span className="payment-label">Status</span>
            <span className={`payment-status ${data.paymentStatus?.toLowerCase()}`}>
              {statusIcon}{data.paymentStatus}
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
              <span className="payment-value">&#8377;{data.securityDeposit}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Charts ─────────────────────────────────── */}
      <ChartsSection bills={bills} />

      {/* ── Savings Tracker ────────────────────────── */}
      <SavingsTracker bills={bills} />

      {/* ── Bill History Table ─────────────────────── */}
      <BillHistoryTable bills={bills} />

    </div>
  );
};

export default Dashboard;