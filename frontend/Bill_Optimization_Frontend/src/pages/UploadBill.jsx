import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { scanAndCreateBill } from "../Reducer/BillSlice";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // ✅
import Loader from "./Loader";

const UploadBill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation(); // ✅
  const { loading, error } = useSelector((state) => state.bill);
  const [file, setFile]       = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || loading) return;
    const result = await dispatch(scanAndCreateBill(file));
    if (scanAndCreateBill.fulfilled.match(result)) navigate("/dashboard");
  };

  if (loading) return (
    <div className="loader-container">
      <div className="spinner" />
      <p style={{ marginTop: "12px", color: "#64748b" }}>
        🔍 {t("uploading")}
      </p>
    </div>
  );

  return (
    <div className="upload-page">
      <div className="upload-card">
        <h2>📤 {t("uploadTitle")}</h2>
        <p>{t("uploadSub")}</p>

        {error && (
          <p style={{ color: "red", marginBottom: "12px" }}>❌ {error}</p>
        )}

        <form onSubmit={handleUpload}>
          <div
            className="dropzone"
            style={dragging ? { borderColor: "#1e88e5", background: "#e0f2fe" } : {}}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              setFile(e.dataTransfer.files[0]);
            }}
            onClick={() => document.getElementById("fileInput").click()}
          >
            <div className="drop-icon">{file ? "✅" : "📄"}</div>
            <div className="drop-title">
              {file ? file.name : t("dropTitle")}
            </div>
            <div className="drop-sub">{t("dropSub")}</div>
            <input
              id="fileInput" type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <div className="upload-formats">
            <span className="format-tag">✅ MSEDCL</span>
            <span className="format-tag">✅ BESCOM</span>
            <span className="format-tag">✅ TPDDL</span>
            <span className="format-tag">✅ KSEB</span>
            <span className="format-tag">+ more</span>
          </div>

          <button
            type="submit"
            className="btn-upload-submit"
            disabled={!file || loading}
          >
            {t("analyseBtn")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadBill;