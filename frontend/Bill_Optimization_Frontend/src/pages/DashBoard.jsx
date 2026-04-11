import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { getAllBills } from "../Reducer/BillSlice";
import { useNavigate } from "react-router-dom";
import { predictNextBill } from "../Reducer/AnalysisSlice";
import { getApplianceProfile } from "../Reducer/ApplianceSlice";
import BillSummary      from "./BillSummary";
import SavingsCard      from "./SavingsCard";
import UsageInsights    from "./UsageInsights";
import DownloadReport   from "./DownloadReport";
import SavingsTracker   from "./SavingsTracker";
import ChartsSection    from "./ChartsSection";
import BillHistoryTable from "./BillHistoryTable";

import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from "recharts";

const APPLIANCE_COLORS = [
  "#3b82f6","#10b981","#f59e0b",
  "#ef4444","#8b5cf6","#ec4899","#06b6d4","#f97316"
];

const calculateGenericBreakdown = (totalUnits, netAmount) => {
  if (!totalUnits || totalUnits === 0) return [];
  const costPerUnit = (netAmount || 0) / totalUnits;
  const appliances = [
    { name:"Air Conditioner", icon:"❄️", watt:1500, hours:8  },
    { name:"Refrigerator",    icon:"🧊", watt:150,  hours:24 },
    { name:"Television",      icon:"📺", watt:100,  hours:6  },
    { name:"Washing Machine", icon:"🫧", watt:500,  hours:1  },
    { name:"Fan",             icon:"🌀", watt:75,   hours:12 },
    { name:"LED Bulbs",       icon:"💡", watt:40,   hours:8  },
    { name:"Others",          icon:"🔌", watt:200,  hours:4  },
  ];
  const raw      = appliances.map(a => ({ ...a, rawKwh:(a.watt*a.hours*30)/1000 }));
  const totalRaw = raw.reduce((s,a) => s+a.rawKwh, 0);
  return raw.map(a => {
    const units   = parseFloat(((a.rawKwh/totalRaw)*totalUnits).toFixed(1));
    const percent = parseFloat(((a.rawKwh/totalRaw)*100).toFixed(1));
    return { name:a.name, icon:a.icon, units, percent, cost:Math.round(units*costPerUnit) };
  });
};

const calculateRealBreakdown = (appliances, totalUnits, netAmount) => {
  if (!appliances?.length || !totalUnits || !netAmount) return [];
  const costPerUnit = netAmount / totalUnits;
  const raw = appliances.map(a => ({
    ...a, rawKwh:(a.wattage*a.quantity*a.hoursPerDay*30)/1000,
  }));
  const totalRaw = raw.reduce((s,a) => s+a.rawKwh, 0);
  return raw.map(a => {
    const units   = parseFloat(((a.rawKwh/totalRaw)*totalUnits).toFixed(1));
    const percent = parseFloat(((a.rawKwh/totalRaw)*100).toFixed(1));
    const cost    = Math.round(units*costPerUnit);
    return { name:a.name, icon:a.icon||"🔌", units, percent, cost, qty:a.quantity, hrs:a.hoursPerDay };
  });
};

/* SVG Icons */
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

/* TrendBadge */
const TrendBadge = ({ trend, pct }) => {
  const config = {
    increasing: { color:"#ef4444", bg:"#fef2f2", border:"#fecaca", icon:"↑", label:"Increasing" },
    decreasing: { color:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0", icon:"↓", label:"Decreasing" },
    stable:     { color:"#d97706", bg:"#fffbeb", border:"#fde68a", icon:"→", label:"Stable"     },
  };
  const c = config[trend] || config.stable;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:"4px",
      background:c.bg, border:`1px solid ${c.border}`,
      color:c.color, borderRadius:"99px",
      fontSize:"12px", fontWeight:700,
      padding:"4px 10px",
    }}>
      {c.icon} {pct}% {c.label}
    </span>
  );
};

/* Dashboard */
const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { bills, loading, error }                                          = useSelector(s => s.bill);
  const { profile }                                                        = useSelector(s => s.appliance);
  const { prediction, predicting, predictionError, basedOn, generatedAt } = useSelector(s => s.analysis);

  useEffect(() => {
    dispatch(getAllBills());
    dispatch(getApplianceProfile());
  }, [dispatch]);

  const data          = bills?.length > 0 ? bills[bills.length - 1] : null;
  const netAmount     = data?.netAmount     || 0;
  const grossAmount   = data?.grossAmount   || 0;
  const unitsBilled   = data?.unitsBilled   || 0;
  const energyCharges = data?.energyCharges || 0;
  const saved         = grossAmount - netAmount;
  const percent       = grossAmount > 0 ? Math.round((saved/grossAmount)*100) : 0;
  const yearlySavings = saved * 12;
  const costPerUnit   = unitsBilled > 0 ? (energyCharges/unitsBilled).toFixed(2) : 0;

  if (loading) return (
    <div className="loader-container"><div className="spinner"/></div>
  );

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
      <button className="dash-upload-btn" onClick={() => dispatch(getAllBills())}>Try Again</button>
    </div>
  );

  if (!data) return (
    <div className="dash-empty">
      <div className="dash-empty-icon-wrap"><FileIcon s={36}/></div>
      <h3>No Bills Found</h3>
      <p>Upload your first electricity bill to get AI-powered insights.</p>
      <button className="dash-upload-btn-lg" onClick={() => navigate("/upload")}>
        <UploadIcon/> Upload Your First Bill
      </button>
    </div>
  );

  const applianceData = profile?.appliances
    ? calculateRealBreakdown(profile.appliances, unitsBilled, netAmount)
    : calculateGenericBreakdown(unitsBilled, netAmount);
  const isRealData = !!profile?.appliances;

  const statusIcon =
    data.paymentStatus === "Paid"    ? <CheckIcon/> :
    data.paymentStatus === "Overdue" ? <XIcon/>     : <ClockIcon/>;

  const formattedTime = generatedAt
    ? new Date(generatedAt).toLocaleTimeString("en-IN",{ hour:"2-digit", minute:"2-digit" })
    : null;

  return (
    <div className="dash-page">

      {/* Header */}
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Dashboard</h2>
          <div className="dash-meta">
            <span className="meta-item"><UserIcon/> Welcome back, <strong>{data.customerName}</strong></span>
            <span className="meta-sep"/>
            <span className="meta-item"><HashIcon/> Customer ID: <strong>{data.consumerNumber}</strong></span>
            <span className="meta-sep"/>
            <span className="meta-item"><CalIcon/> Date: <strong>{data.billMonth}</strong></span>
          </div>
        </div>
        <div className="dash-header-btns">
          <DownloadReport data={data}/>
          <button className="dash-upload-btn" onClick={() => navigate("/upload")}>
            <UploadIcon/> Upload New Bill
          </button>
        </div>
      </div>

      {/* Info Bar */}
      <div className="info-bar">
        <span className="info-bar-item"><span className="info-dot"/><CalIcon/>{data.billMonth}</span>
        <span className="info-bar-item">
          <span className="info-dot"/><CalIcon/> Due:{" "}
          {data.dueDate ? new Date(data.dueDate).toLocaleDateString("en-IN") : "N/A"}
        </span>
        <span className="info-bar-item"><span className="info-dot"/><HomeIcon/>{data.consumerType}</span>
        <span className="info-bar-item"><span className="info-dot"/><HashIcon/>{data.consumerNumber}</span>
      </div>

      {/* KPI Row */}
      <div className="kpi-row">
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon-box kpi-icon-blue"><Bolt/></div>
          <div className="kpi-label">Units Consumed</div>
          <div className="kpi-value kpi-val-blue">{unitsBilled} <span className="kpi-unit">kWh</span></div>
          <span className="kpi-badge neutral">&#8377;{costPerUnit}/unit</span>
        </div>
        <div className="kpi-card kpi-dark">
          <div className="kpi-icon-box kpi-icon-dark"><CardIcon/></div>
          <div className="kpi-label">Total Bill</div>
          <div className="kpi-value kpi-val-dark">&#8377;{netAmount.toLocaleString("en-IN")}</div>
          <span className="kpi-badge warn">Gross &#8377;{grossAmount.toLocaleString("en-IN")}</span>
        </div>
        <div className="kpi-card kpi-green">
          <div className="kpi-icon-box kpi-icon-green"><Rupee/></div>
          <div className="kpi-label">Rebate Savings</div>
          <div className="kpi-value kpi-val-green">&#8377;{saved.toLocaleString("en-IN")}</div>
          <span className="kpi-badge up">+{percent}% saved</span>
        </div>
        <div className="kpi-card kpi-teal">
          <div className="kpi-icon-box kpi-icon-teal"><TrendUp/></div>
          <div className="kpi-label">Yearly Projection</div>
          <div className="kpi-value kpi-val-teal">&#8377;{yearlySavings.toLocaleString("en-IN")}</div>
          <span className="kpi-badge up">Based on this bill</span>
        </div>
      </div>

      {/* Sub Cards */}
      <div className="dash-grid">
        <BillSummary   data={data}/>
        <SavingsCard   data={data}/>
        <UsageInsights data={data}/>
      </div>

      {/* Appliance Cost Breakdown */}
      <div className="dash-chart-card">
        <h3 className="card-section-title">
          <span className="title-icon-wrap blue-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </span>
          Appliance Cost Breakdown
        </h3>
        <p style={{ fontSize:"12px", color:"#94a3b8", marginBottom:"16px" }}>
          {isRealData
            ? `Based on your ${profile.consumerType} appliance profile`
            : "Generic estimate — fill your appliance profile for accuracy"}
          {!isRealData && (
            <a href="/appliances" style={{ color:"#22c55e", fontWeight:700, marginLeft:"6px" }}>
              Fill now →
            </a>
          )}
        </p>
        {applianceData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={applianceData} cx="50%" cy="50%"
                  innerRadius={50} outerRadius={85} dataKey="cost" paddingAngle={3}>
                  {applianceData.map((_, index) => (
                    <Cell key={index} fill={APPLIANCE_COLORS[index % APPLIANCE_COLORS.length]}/>
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`₹${val.toLocaleString("en-IN")}`, "Cost"]}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop:"16px" }}>
              {applianceData.map((item, index) => (
                <div key={item.name} style={{ marginBottom:"14px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"5px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <span style={{ fontSize:"18px" }}>{item.icon}</span>
                      <span style={{ fontSize:"13px", fontWeight:600, color:"#0f172a" }}>
                        {item.name}
                        {item.qty && (
                          <span style={{ color:"#94a3b8", fontWeight:400, fontSize:"11px" }}>
                            {" "}({item.qty} unit{item.qty>1?"s":""}, {item.hrs}hrs/day)
                          </span>
                        )}
                      </span>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <span style={{ fontSize:"14px", fontWeight:800, color:"#0f172a" }}>
                        ₹{item.cost?.toLocaleString("en-IN")}
                      </span>
                      <span style={{ fontSize:"11px", color:"#94a3b8", marginLeft:"6px" }}>
                        {item.units} kWh · {item.percent}%
                      </span>
                    </div>
                  </div>
                  <div style={{ background:"#f1f5f9", borderRadius:"99px", height:"7px", overflow:"hidden" }}>
                    <div style={{
                      width:`${item.percent}%`, height:"7px", borderRadius:"99px",
                      background:APPLIANCE_COLORS[index % APPLIANCE_COLORS.length],
                      transition:"width 0.8s ease",
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign:"center", padding:"32px 0", color:"#94a3b8", fontSize:"14px" }}>
            No appliance data available. Upload a bill to see breakdown.
          </div>
        )}
        <div style={{
          marginTop:"16px", padding:"12px 16px",
          background:"#f0fdf4", borderRadius:"10px",
          border:"1px solid #86efac",
          display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <span style={{ fontSize:"13px", fontWeight:600, color:"#15803d" }}>Total Bill Amount</span>
          <span style={{ fontSize:"16px", fontWeight:800, color:"#16a34a" }}>
            ₹{netAmount.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Predict Next Bill Button */}
      <div className="predict-btn-row">
        <div className="predict-btn-wrap">
          <button
            className={`predict-main-btn${predicting?" predict-main-btn--loading":""}`}
            onClick={() => dispatch(predictNextBill())}
            disabled={predicting}
          >
            {predicting ? (
              <><span className="predict-spinner"/>Predicting…</>
            ) : (
              <><span className="predict-btn-icon">🔮</span>Predict Next Month's Bill</>
            )}
          </button>
          <p className="predict-btn-sub">AI-powered forecast using your last 3 bills</p>
        </div>
      </div>

      {/* Prediction Error */}
      {predictionError && !predicting && (
        <div className="predict-error-strip">
          <span>⚠️ {predictionError}</span>
          <button onClick={() => dispatch(predictNextBill())} className="predict-retry-btn">
            Try Again
          </button>
        </div>
      )}

      {/* Prediction Result Card */}
      {prediction && !predicting && (
        <div className="predict-result-card">
          <div className="predict-result-header">
            <div>
              <div className="predict-result-label">🔮 Next Month Prediction</div>
              <div className="predict-result-sublabel">
                AI-powered forecast based on your bill history
                {basedOn > 0 && (
                  <span className="predict-based-on">{basedOn} bill{basedOn>1?"s":""} analysed</span>
                )}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px" }}>
              <TrendBadge trend={prediction.trend} pct={prediction.trendPercentage}/>
              {formattedTime && (
                <span style={{ fontSize:"10px", color:"#cbd5e1" }}>Generated at {formattedTime}</span>
              )}
            </div>
          </div>
          <div className="predict-amount-row">
            <p className="predict-amount-label">Predicted Net Amount</p>
            <div className="predict-amount-value">
              <span className="predict-currency">₹</span>
              <span className="predict-amount-number">
                {prediction.predictedNetAmount?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          <div className="predict-stats-grid">
            {[
              { label:"Units",          value:`${prediction.predictedUnits} kWh`,                               color:"#3b82f6" },
              { label:"Energy Charges", value:`₹${prediction.predictedEnergyCharges?.toLocaleString("en-IN")}`, color:"#f59e0b" },
              { label:"Gross Amount",   value:`₹${prediction.predictedGrossAmount?.toLocaleString("en-IN")}`,   color:"#8b5cf6" },
            ].map(item => (
              <div key={item.label} className="predict-stat-box">
                <p className="predict-stat-label">{item.label}</p>
                <p className="predict-stat-value" style={{ color:item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
          <div className="predict-divider"/>
          {prediction.reason && (
            <div className="predict-analysis">
              <p className="predict-section-head">📊 Analysis</p>
              <p className="predict-section-body">{prediction.reason}</p>
            </div>
          )}
          {prediction.savingTip && (
            <div className="predict-tip-box">
              <p className="predict-tip-head">💡 Saving Tip</p>
              <p className="predict-tip-body">{prediction.savingTip}</p>
            </div>
          )}
        </div>
      )}

      {/* Payment Info */}
      <div className="dash-chart-card">
        <h3 className="card-section-title">
          <span className="title-icon-wrap green-icon"><CardIcon/></span>
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

      {/* Charts */}
      <ChartsSection bills={bills}/>

      {/* Savings Tracker */}
      <SavingsTracker bills={bills}/>

      {/* Bill History Table */}
      <BillHistoryTable bills={bills}/>

    </div>
  );
};

export default Dashboard;