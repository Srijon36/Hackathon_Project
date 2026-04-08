import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { scanAndCreateBill } from "../Reducer/BillSlice";
import { getApplianceProfile } from "../Reducer/ApplianceSlice";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const UTILITY_BOARDS = ["MSEDCL", "BESCOM", "TPDDL", "KSEB", "CESC"];
const API_BASE = "http://localhost:5000/api";

// ─── Helper: always get token from correct storage ───────────
const getToken = () => {
  try {
    const raw = sessionStorage.getItem("energy_token");
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
};

const UploadBill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { loading, error } = useSelector((state) => state.bill);
  const { profile } = useSelector((state) => state.appliance);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);

  // ─── Payment Gate State ──────────────────────────────────────
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    dispatch(getApplianceProfile());
    fetchUploadStatus();
  }, [dispatch]);

  // ─── Fetch upload status ─────────────────────────────────────
  const fetchUploadStatus = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/payment/upload-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUploadStatus(data);
    } catch (err) {
      console.error("Failed to fetch upload status", err);
    }
  };

  // ─── Load Razorpay script ────────────────────────────────────
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ─── Handle Payment ──────────────────────────────────────────
  const handlePayment = async () => {
    setPaymentLoading(true);
    setPaymentError("");

    const loaded = await loadRazorpay();
    if (!loaded) {
      setPaymentError("Failed to load payment gateway. Check your internet.");
      setPaymentLoading(false);
      return;
    }

    try {
      const token = getToken();

      const orderRes = await fetch(`${API_BASE}/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        setPaymentError("Could not create order. Try again.");
        setPaymentLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "MyEnergy",
        description: "5 Bill Uploads Pack",
        order_id: orderData.order.id,
        handler: async (response) => {
          const verifyRes = await fetch(`${API_BASE}/payment/verify-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            await fetchUploadStatus();
            setShowPaymentPopup(false);
            setPaymentLoading(false);
          } else {
            setPaymentError("Payment verification failed. Contact support.");
            setPaymentLoading(false);
          }
        },
        prefill: {},
        theme: { color: "#22c55e" },
        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setPaymentError("Something went wrong. Try again.");
      setPaymentLoading(false);
    }
  };

  // ─── Handle Upload with gate check ──────────────────────────
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || loading) return;

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/payment/upload-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!data.canUpload) {
        setShowPaymentPopup(true);
        return;
      }
    } catch (err) {
      console.error("Status check failed", err);
    }

    const result = await dispatch(scanAndCreateBill(file));
    if (scanAndCreateBill.fulfilled.match(result)) navigate("/dashboard");
  };

  if (loading)
    return (
      <div className="loader-container">
        <div className="spinner" />
        <p style={{ marginTop: "12px", color: "#64748b" }}>
          🔍 {t("uploading")}
        </p>
      </div>
    );

  return (
    <div className="eb-upload-page">

      {/* ─── Payment Popup ─────────────────────────────────── */}
      {showPaymentPopup && (
        <div className="payment-overlay">
          <div className="payment-modal">
            <div className="payment-modal-icon">⚡</div>
            <h2 className="payment-modal-title">Unlock More Uploads</h2>
            <p className="payment-modal-desc">
              You've used your free upload. Get{" "}
              <strong>5 more uploads</strong> for just
            </p>
            <div className="payment-price-box">
              <span className="payment-price-amount">₹5</span>
              <p className="payment-price-sub">
                One-time • 5 uploads • No subscription
              </p>
            </div>
            <div className="payment-features">
              {[
                "5 bill uploads",
                "Full AI analysis per bill",
                "Dashboard access always free",
              ].map((item) => (
                <div key={item} className="payment-feature-item">
                  <span className="payment-feature-check">✓</span>
                  {item}
                </div>
              ))}
            </div>
            {paymentError && (
              <p className="payment-error">❌ {paymentError}</p>
            )}
            <button
              className="payment-pay-btn"
              onClick={handlePayment}
              disabled={paymentLoading}
            >
              {paymentLoading ? "Processing..." : "Pay ₹5 & Unlock 5 Uploads"}
            </button>
            <button
              className="payment-cancel-btn"
              onClick={() => {
                setShowPaymentPopup(false);
                setPaymentError("");
              }}
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* ─── Page Inner ────────────────────────────────────── */}
      <div className="eb-upload-inner">

        {/* Credits Badge */}
        {uploadStatus && (
          <div
            className={`upload-credits-badge ${
              uploadStatus.canUpload
                ? "upload-credits-badge--available"
                : "upload-credits-badge--locked"
            }`}
          >
            {!uploadStatus.freeUploadUsed
              ? "⚡ 1 free upload available"
              : uploadStatus.uploadCredits > 0
              ? `🎟️ ${uploadStatus.uploadCredits} upload${
                  uploadStatus.uploadCredits > 1 ? "s" : ""
                } remaining`
              : "🔴 No uploads left – purchase to continue"}
          </div>
        )}

        {/* Hero Text */}
        <div className="eb-hero-text">
          <h2 className="eb-hero-title">
            Decipher Your <span className="eb-hero-title-green">Energy.</span>
          </h2>
          <p className="eb-hero-sub">
            Upload your digital electricity bills to understand costs, patterns,
            and savings through our editorial-grade analysis engine.
          </p>
        </div>

        {error && <p className="eb-error-msg">❌ {error}</p>}

        {/* Appliance Profile Banner */}
        {!profile ? (
          <div className="eb-appliance-banner eb-appliance-banner--warn">
            <div className="eb-appliance-banner-left">
              <span className="eb-appliance-banner-icon">⚡</span>
              <div>
                <div className="eb-appliance-banner-title">
                  Fill appliance details for accurate cost breakdown
                </div>
                <div className="eb-appliance-banner-sub">
                  Get appliance-wise cost analysis (AC, Fridge, TV etc.)
                </div>
              </div>
            </div>
            <Link to="/appliances" className="eb-appliance-banner-btn">
              Fill Now →
            </Link>
          </div>
        ) : (
          <div className="eb-appliance-banner eb-appliance-banner--ok">
            <span className="eb-appliance-banner-icon">✅</span>
            <div className="eb-appliance-banner-title" style={{ color: "#166534" }}>
              Appliance profile saved — {profile.consumerType} •{" "}
              {profile.appliances?.length} appliances
            </div>
            <Link to="/appliances" className="eb-appliance-edit-link">
              Edit →
            </Link>
          </div>
        )}

        {/* ─── Two-column main card ────────────────────────── */}
        <form className="eb-main-grid" onSubmit={handleUpload}>

          {/* Left: Drop Zone */}
          <div
            className={`eb-dropzone${dragging ? " eb-dragging" : ""}${file ? " eb-has-file" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              setFile(e.dataTransfer.files[0]);
            }}
            onClick={() => document.getElementById("ebFileInput").click()}
          >
            <div className="eb-drop-icon-wrap">
              {file ? (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14 2 14 8 20 8" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
                  <polyline points="10 9 9 9 8 9" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14 2 14 8 20 8" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <h3 className="eb-drop-title">{file ? file.name : "Attach Bill"}</h3>
            <p className="eb-drop-sub">
              {file
                ? "File ready for analysis"
                : "PDF, JPG, or PNG files supported (Max 10MB)"}
            </p>
            {!file && (
              <button
                type="button"
                className="eb-browse-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById("ebFileInput").click();
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Browse Files
              </button>
            )}
            <input
              id="ebFileInput"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          {/* Right: Board + Scan */}
          <div className="eb-right-col">
            {/* Utility Board Selection */}
            <div className="eb-board-section">
              <p className="eb-board-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", marginRight: 6, verticalAlign: "middle" }}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                SELECT UTILITY BOARD
              </p>
              <div className="eb-board-chips">
                {UTILITY_BOARDS.map((board) => (
                  <button
                    key={board}
                    type="button"
                    className={`eb-chip${selectedBoard === board ? " eb-chip-active" : ""}`}
                    onClick={() => setSelectedBoard(board)}
                  >
                    {board}
                  </button>
                ))}
              </div>
            </div>

            {/* Scan Button */}
            <button
              type="submit"
              className="eb-scan-btn"
              disabled={!file || loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              Scan &amp; Analyse
            </button>

            <p className="eb-scan-security">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", marginRight: 5, verticalAlign: "middle" }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              SECURE OCR PROCESSING &amp; ENCRYPTION ENABLED
            </p>
          </div>
        </form>

        {/* Feature Cards */}
        <div className="eb-features-row">
          <div className="eb-feature-card">
            <div className="eb-feature-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div className="eb-feature-card-title">SOLAR GENERATION SUPPORT</div>
            <div className="eb-feature-card-desc">
              Analyze net-metering and rooftop solar efficiency.
            </div>
          </div>
          <div className="eb-feature-card">
            <div className="eb-feature-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
            </div>
            <div className="eb-feature-card-title">MULTI-TARIFF ANALYSIS</div>
            <div className="eb-feature-card-desc">
              Optimize consumption based on peak and off-peak rates.
            </div>
          </div>
          <div className="eb-feature-card">
            <div className="eb-feature-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="M7 12.5c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.5-.66 2.85-1.7 3.78L12 22l-3.3-5.72A4.98 4.98 0 0 1 7 12.5z"/>
              </svg>
            </div>
            <div className="eb-feature-card-title">CARBON TRACKING</div>
            <div className="eb-feature-card-desc">
              Visualize the environmental impact of your energy usage.
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="eb-footer">
        <div className="eb-footer-logo">ENERGYBILL</div>
        <div className="eb-footer-copy">© 2024 ENERGYBILL. PRECISION EDITORIAL ANALYSIS.</div>
        <div className="eb-footer-links">
          <span>PRIVACY POLICY</span>
          <span>TERMS</span>
          <span>SUPPORT</span>
        </div>
      </footer>
    </div>
  );
};

export default UploadBill;