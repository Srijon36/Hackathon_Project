import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { scanAndCreateBill, clearScanSuccess, clearError } from "../Reducer/BillSlice";
import { useState } from "react";

const UploadBill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, scanSuccess } = useSelector((state) => state.bill);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // ✅ navigate to dashboard when scan succeeds
  useEffect(() => {
    if (scanSuccess) {
      dispatch(clearScanSuccess());
      navigate("/dashboard");
    }
  }, [scanSuccess]);

  // ✅ clear error on mount
  useEffect(() => {
    dispatch(clearError());
  }, []);

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return alert("File must be under 10MB");
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = () => {
    if (!file) return alert("Please select a bill image first");
    dispatch(scanAndCreateBill(file));
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        <h2>📤 Upload Your Bill</h2>
        <p>We'll scan and analyse it instantly.</p>

        {error && <p className="text-red">❌ {error}</p>}

        <div
          className={`dropzone ${dragOver ? "drag-active" : ""}`}
          onClick={() => document.getElementById("bill-input").click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {file ? (
            <>
              <div className="drop-icon">✅</div>
              <div className="drop-title">{file.name}</div>
              <div className="drop-sub">Supports PDF, JPG, PNG up to 10MB</div>
            </>
          ) : (
            <>
              <div className="drop-icon">📂</div>
              <div className="drop-title">Click or drag your bill here</div>
              <div className="drop-sub">Supports PDF, JPG, PNG up to 10MB</div>
            </>
          )}
          <input
            id="bill-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        <div className="upload-formats">
          {["✅ MSEDCL", "✅ BESCOM", "✅ TPDDL", "✅ KSEB", "✅ CESC", "+ more"].map((tag) => (
            <span key={tag} className="format-tag">{tag}</span>
          ))}
        </div>

        <button
          className="btn-upload-submit"
          onClick={handleSubmit}
          disabled={loading || !file}
        >
          {loading ? "⏳ Scanning your bill..." : "⚡ Scan & Analyse My Bill"}
        </button>
      </div>
    </div>
  );
};

export default UploadBill;