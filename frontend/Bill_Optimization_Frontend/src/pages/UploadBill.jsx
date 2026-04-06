import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { scanAndCreateBill } from "../Reducer/BillSlice";
import { getApplianceProfile } from "../Reducer/ApplianceSlice"; // ✅ new
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const UTILITY_BOARDS = ["MSEDCL", "BESCOM", "TPDDL", "KSEB"];

const UploadBill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t }    = useTranslation();

  const { loading, error }  = useSelector((state) => state.bill);
  const { profile }         = useSelector((state) => state.appliance); // ✅ new

  const [file,          setFile]          = useState(null);
  const [dragging,      setDragging]      = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);

  // ✅ Load appliance profile on mount
  useEffect(() => {
    dispatch(getApplianceProfile());
  }, [dispatch]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || loading) return;
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
      {/* Abstract decoration */}
      <div className="eb-bg-decoration" aria-hidden="true">
        <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,1000 C300,800 400,900 700,600 C900,400 1000,500 1000,0 L1000,1000 Z"
            fill="rgba(255,255,255,0.07)"
          />
        </svg>
      </div>

      <div className="eb-upload-inner">
        {/* Hero Text */}
        <div className="eb-hero-text">
          <h2 className="eb-hero-title">Decipher Your Energy.</h2>
          <p className="eb-hero-sub">
            Upload your monthly utility bill for a deep-dive analysis of your
            consumption patterns and potential savings.
          </p>
        </div>

        {/* Glassmorphic Card */}
        <div className="eb-glass-card">
          {error && <p className="eb-error-msg">❌ {error}</p>}

          {/* ✅ Appliance Profile Banner */}
          {!profile ? (
            <div style={{
              background: "rgba(251,191,36,0.12)",
              border: "1px solid rgba(251,191,36,0.4)",
              borderRadius: "12px", padding: "14px 18px",
              marginBottom: "20px",
              display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: "12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>⚡</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>
                    Fill appliance details for accurate cost breakdown
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "2px" }}>
                    Get appliance-wise cost analysis (AC, Fridge, TV etc.)
                  </div>
                </div>
              </div>
              <Link
                to="/appliances"
                style={{
                  padding: "8px 18px", background: "#22c55e",
                  color: "#fff", borderRadius: "8px",
                  fontSize: "12px", fontWeight: 700,
                  textDecoration: "none", whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Fill Now →
              </Link>
            </div>
          ) : (
            <div style={{
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: "12px", padding: "12px 18px",
              marginBottom: "20px",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <span style={{ fontSize: "18px" }}>✅</span>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                Appliance profile saved — {profile.consumerType} • {profile.appliances?.length} appliances
              </div>
              <Link
                to="/appliances"
                style={{
                  marginLeft: "auto", fontSize: "12px",
                  color: "#4ade80", fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Edit →
              </Link>
            </div>
          )}

          <form onSubmit={handleUpload}>
            {/* Drop Zone */}
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
                <span className="material-symbols-outlined eb-drop-icon">
                  {file ? "check_circle" : "upload_file"}
                </span>
              </div>
              <h3 className="eb-drop-title">
                {file ? file.name : "Attach Bill"}
              </h3>
              <p className="eb-drop-sub">
                {file ? "File ready for analysis" : "PDF, PNG or JPG (Max 10MB)"}
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

            {/* Utility Board Selection */}
            <div className="eb-board-section">
              <p className="eb-board-label">SELECT UTILITY BOARD</p>
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

            {/* Submit Button */}
            <div className="eb-submit-wrap">
              <button
                type="submit"
                className="eb-scan-btn"
                disabled={!file || loading}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                Scan &amp; Analyse
              </button>
            </div>
          </form>
        </div>

        {/* Feature Pills */}
        <div className="eb-features-row">
          <div className="eb-feature-pill">
            <div className="eb-feature-icon-wrap">
              <span className="material-symbols-outlined eb-feature-icon">solar_power</span>
            </div>
            <span className="eb-feature-text">Solar Generation Support</span>
          </div>
          <div className="eb-feature-pill">
            <div className="eb-feature-icon-wrap">
              <span className="material-symbols-outlined eb-feature-icon">analytics</span>
            </div>
            <span className="eb-feature-text">Multi-Tariff Analysis</span>
          </div>
          <div className="eb-feature-pill">
            <div className="eb-feature-icon-wrap">
              <span className="material-symbols-outlined eb-feature-icon">co2</span>
            </div>
            <span className="eb-feature-text">Carbon Footprint Tracking</span>
          </div>
        </div>
      </div>

      {/* Side decoration */}
      <div className="eb-side-decoration" aria-hidden="true">
        <div className="eb-side-line" />
        <div className="eb-side-text-wrap">
          <span className="eb-side-text">Powered by Renewable Intelligence</span>
          <span className="eb-side-text">Version 2.4.0</span>
        </div>
        <div className="eb-side-line" />
      </div>
    </div>
  );
};

export default UploadBill;