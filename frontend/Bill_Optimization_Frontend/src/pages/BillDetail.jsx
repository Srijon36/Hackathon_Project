import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getBillById, deleteBill } from "../Reducer/BillSlice";

const BillDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id }   = useParams();

  const { billData, loading, error } = useSelector((state) => state.bill);

  useEffect(() => {
    if (id) dispatch(getBillById(id));
  }, [id, dispatch]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      await dispatch(deleteBill(id));
      navigate("/dashboard");
    }
  };

  if (loading) return (
    <div className="loader-container">
      <div className="spinner" />
    </div>
  );

  if (error) return (
    <div className="loader-container">
      <p style={{ color: "#ef4444" }}>❌ {error}</p>
      <button className="nav-btn" onClick={() => navigate("/dashboard")}>
        ← Back
      </button>
    </div>
  );

  if (!billData) return (
    <div className="loader-container">
      <p style={{ color: "#64748b" }}>Bill not found.</p>
      <button className="nav-btn" onClick={() => navigate("/dashboard")}>
        ← Back
      </button>
    </div>
  );

  const bill  = billData?.data || billData;
  const saved = (bill.grossAmount || 0) - (bill.netAmount || 0);

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
          <h2>🧾 Bill Detail</h2>
          <p>{bill.customerName} · {bill.billMonth}</p>
        </div>

        {/* ✅ Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="dash-upload-btn"
            onClick={() => navigate(`/analysis/${id}`)}
          >
            📊 Analyse
          </button>
          <button
            className="dash-upload-btn"
            style={{ background: "#ef4444" }}
            onClick={handleDelete}
          >
            🗑 Delete
          </button>
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
          <div className="kpi-label">Net Amount</div>
          <div className="kpi-value">
            ₹{(bill.netAmount || 0).toLocaleString("en-IN")}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Rebate Saved</div>
          <div className="kpi-value green">
            ₹{saved.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Payment Status</div>
          <div
            className="kpi-value"
            style={{
              color: bill.paymentStatus === "Paid"    ? "#10b981" :
                     bill.paymentStatus === "Overdue" ? "#ef4444" : "#f59e0b",
            }}
          >
            {bill.paymentStatus || "Pending"}
          </div>
        </div>
      </div>

      {/* ── Bill Info Grid ────────────────────── */}
      <div className="charts-grid" style={{ marginTop: "24px" }}>

        {/* Consumer Info */}
        <div className="chart-card">
          <h3>👤 Consumer Info</h3>
          {[
            { label: "Consumer Number", value: bill.consumerNumber || "N/A" },
            { label: "Customer Name",   value: bill.customerName   || "N/A" },
            { label: "Address",         value: bill.address        || "N/A" },
            { label: "Consumer Type",   value: bill.consumerType   || "N/A" },
            { label: "Load (KVA)",      value: `${bill.loadKVA || 0} KVA` },
          ].map((item) => (
            <div key={item.label} className="dash-row">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>

        {/* Bill Info */}
        <div className="chart-card">
          <h3>📅 Bill Info</h3>
          {[
            { label: "Bill Month", value: bill.billMonth || "N/A" },
            { label: "Bill Date",  value: bill.billDate  ? new Date(bill.billDate).toLocaleDateString("en-IN")  : "N/A" },
            { label: "Due Date",   value: bill.dueDate   ? new Date(bill.dueDate).toLocaleDateString("en-IN")   : "N/A" },
            { label: "Units",      value: `${bill.unitsBilled || 0} kWh` },
            { label: "Cost/Unit",  value: bill.unitsBilled > 0 ? `₹${((bill.energyCharges || 0) / bill.unitsBilled).toFixed(2)}` : "N/A" },
          ].map((item) => (
            <div key={item.label} className="dash-row">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>

        {/* Charges Breakdown */}
        <div className="chart-card">
          <h3>💰 Charges Breakdown</h3>
          {[
            { label: "Energy Charges",  value: `₹${(bill.energyCharges      || 0).toLocaleString("en-IN")}` },
            { label: "Fixed Charges",   value: `₹${(bill.fixedDemandCharges || 0).toLocaleString("en-IN")}` },
            { label: "Govt Duty",       value: `₹${(bill.govtDuty           || 0).toLocaleString("en-IN")}` },
            { label: "Meter Rent",      value: `₹${(bill.meterRent          || 0).toLocaleString("en-IN")}` },
            { label: "Adjustments",     value: `₹${(bill.adjustments        || 0).toLocaleString("en-IN")}` },
            { label: "Rebate",          value: `- ₹${(bill.rebate           || 0).toLocaleString("en-IN")}`, green: true },
          ].map((item) => (
            <div key={item.label} className="dash-row">
              <span>{item.label}</span>
              <strong className={item.green ? "green" : ""}>
                {item.value}
              </strong>
            </div>
          ))}
        </div>

        {/* Payment Info */}
        <div className="chart-card">
          <h3>💳 Payment Info</h3>
          {[
            { label: "Gross Amount",      value: `₹${(bill.grossAmount || 0).toLocaleString("en-IN")}` },
            { label: "Net Amount",        value: `₹${(bill.netAmount   || 0).toLocaleString("en-IN")}` },
            { label: "You Saved",         value: `₹${saved.toLocaleString("en-IN")}`,                    green: true },
            { label: "Payment Status",    value: bill.paymentStatus  || "Pending" },
            { label: "Payment Mode",      value: bill.paymentMode    || "N/A" },
            { label: "Security Deposit",  value: `₹${(bill.securityDeposit || 0).toLocaleString("en-IN")}` },
          ].map((item) => (
            <div key={item.label} className="dash-row">
              <span>{item.label}</span>
              <strong className={item.green ? "green" : ""}>
                {item.value}
              </strong>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default BillDetail;