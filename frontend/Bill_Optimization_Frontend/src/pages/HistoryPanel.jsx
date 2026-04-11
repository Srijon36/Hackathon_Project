import { useNavigate } from "react-router-dom";

const HistoryIcon = (p) => (
  <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
  </svg>
);
const CloseIcon = (p) => (
  <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6"  y1="6" x2="18" y2="18"/>
  </svg>
);
const FileIcon = (p) => (
  <svg width={p.s||13} height={p.s||13} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
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
const HashIcon = (p) => (
  <svg width={p.s||11} height={p.s||11} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4"  y1="9"  x2="20" y2="9"/>
    <line x1="4"  y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3"  x2="8"  y2="21"/>
    <line x1="16" y1="3"  x2="14" y2="21"/>
  </svg>
);
const CalIcon = (p) => (
  <svg width={p.s||11} height={p.s||11} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
);
const BoltIcon = (p) => (
  <svg width={p.s||11} height={p.s||11} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const HistoryPanel = ({ bills, open, onClose }) => {
  const navigate = useNavigate();

  const statusColor = {
    Paid:    { bg: "#dcfce7", color: "#15803d" },
    Pending: { bg: "#fef9c3", color: "#92400e" },
    Overdue: { bg: "#fee2e2", color: "#b91c1c" },
  };

  return (
    <>
      <div
        className={`hist-overlay${open ? " hist-overlay--open" : ""}`}
        onClick={onClose}
      />
      <aside className={`hist-panel${open ? " hist-panel--open" : ""}`}>

        {/* Header */}
        <div className="hist-header">
          <div className="hist-header-left">
            <span className="hist-header-icon"><HistoryIcon s={16}/></span>
            <div>
              <h3 className="hist-title">Bill History</h3>
              <p className="hist-sub">{bills?.length || 0} bills found</p>
            </div>
          </div>
          <button className="hist-close" onClick={onClose}><CloseIcon s={18}/></button>
        </div>

        {/* List */}
        <div className="hist-list">
          {!bills || bills.length === 0 ? (
            <div className="hist-empty">
              <FileIcon s={36}/>
              <p>No bills yet</p>
            </div>
          ) : (
            [...bills].reverse().map((bill, i) => {
              const sc = statusColor[bill.paymentStatus] || statusColor.Pending;
              return (
                <div key={bill._id || i} className="hist-item">
                  <div className="hist-item-top">
                    <span className="hist-month">{bill.billMonth}</span>
                    <span className="hist-status" style={{ background: sc.bg, color: sc.color }}>
                      {bill.paymentStatus}
                    </span>
                  </div>
                  <div className="hist-item-mid">
                    <span className="hist-name">{bill.customerName}</span>
                    <span className="hist-amount">₹{bill.netAmount?.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="hist-item-bot">
                    <span className="hist-meta"><HashIcon s={11}/> {bill.consumerNumber}</span>
                    <span className="hist-meta">
                      <CalIcon s={11}/> Due: {bill.dueDate
                        ? new Date(bill.dueDate).toLocaleDateString("en-IN")
                        : "N/A"}
                    </span>
                    <span className="hist-meta"><BoltIcon s={11}/> {bill.unitsBilled} kWh</span>
                  </div>
                  <div className="hist-item-actions">
                    <button
                      className="hist-act-btn hist-act-view"
                      onClick={() => { onClose(); navigate(`/bill/${bill._id}`); }}
                    >
                      View
                    </button>
                    <button
                      className="hist-act-btn hist-act-analyse"
                      onClick={() => { onClose(); navigate(`/analysis/${bill._id}`); }}
                    >
                      Analyse
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="hist-footer">
          <button
            className="hist-footer-btn"
            onClick={() => { onClose(); navigate("/upload"); }}
          >
            <UploadIcon s={14}/> Upload New Bill
          </button>
        </div>

      </aside>
    </>
  );
};

export default HistoryPanel;