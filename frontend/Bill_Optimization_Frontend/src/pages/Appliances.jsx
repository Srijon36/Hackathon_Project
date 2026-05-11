import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getApplianceProfile,
  saveApplianceProfile,
  addSingleAppliance,
  deleteSingleAppliance,
  updateSingleAppliance,
} from "../Reducer/ApplianceSlice";
import { useNavigate } from "react-router-dom";

const COMMON_APPLIANCES = [
  { name: "Air Conditioner", icon: "❄️", wattage: 1500 },
  { name: "Refrigerator",    icon: "🧊", wattage: 150  },
  { name: "Television",      icon: "📺", wattage: 100  },
  { name: "Washing Machine", icon: "🫧", wattage: 500  },
  { name: "Fan",             icon: "🌀", wattage: 75   },
  { name: "LED Bulbs",       icon: "💡", wattage: 10   },
  { name: "Water Heater",    icon: "🚿", wattage: 2000 },
  { name: "Microwave",       icon: "📡", wattage: 1000 },
  { name: "Laptop",          icon: "💻", wattage: 65   },
  { name: "Iron",            icon: "👔", wattage: 1000 },
  { name: "Mixer/Grinder",   icon: "🍳", wattage: 750  },
  { name: "WiFi Router",     icon: "📶", wattage: 10   },
];

const CONSUMER_TYPES = [
  { key: "domestic",   label: "Domestic",   icon: "🏠" },
  { key: "commercial", label: "Commercial", icon: "🏢" },
  { key: "industrial", label: "Industrial", icon: "🏭" },
];

export default function Appliances() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading, error, profile } = useSelector((s) => s.appliance);

  const [consumerType, setConsumerType] = useState("domestic");
  const [showAddForm,  setShowAddForm]  = useState(false);
  const [newAppliance, setNewAppliance] = useState({
    name: "", icon: "🔌", wattage: "", quantity: 1,
    hoursPerDay: 4, starRating: "",
  });
  const [customName, setCustomName] = useState(false);
  const [successMsg,  setSuccessMsg] = useState("");
  const [editingId,   setEditingId]  = useState(null);
  const [editData,    setEditData]   = useState({});

  useEffect(() => {
    dispatch(getApplianceProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) setConsumerType(profile.consumerType);
  }, [profile]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // ── Handlers ───────────────────────────────────────
  const handleSelectCommon = (appliance) => {
    setNewAppliance((prev) => ({
      ...prev,
      name:    appliance.name,
      icon:    appliance.icon,
      wattage: appliance.wattage,
    }));
    setCustomName(false);
  };

  const handleAddAppliance = async () => {
    if (!newAppliance.name || !newAppliance.wattage) return;

    if (!profile) {
      // Create profile first
      await dispatch(saveApplianceProfile({
        consumerType,
        appliances: [{
          name:        newAppliance.name,
          icon:        newAppliance.icon,
          wattage:     Number(newAppliance.wattage),
          quantity:    Number(newAppliance.quantity),
          hoursPerDay: Number(newAppliance.hoursPerDay),
          starRating:  newAppliance.starRating
            ? Number(newAppliance.starRating) : null,
        }],
      }));
    } else {
      await dispatch(addSingleAppliance({
        name:        newAppliance.name,
        icon:        newAppliance.icon,
        wattage:     Number(newAppliance.wattage),
        quantity:    Number(newAppliance.quantity),
        hoursPerDay: Number(newAppliance.hoursPerDay),
        starRating:  newAppliance.starRating
          ? Number(newAppliance.starRating) : null,
      }));
    }

    setNewAppliance({
      name: "", icon: "🔌", wattage: "", quantity: 1,
      hoursPerDay: 4, starRating: "",
    });
    setShowAddForm(false);
    showSuccess("Appliance added!");
    dispatch(getApplianceProfile());
  };

  const handleDelete = async (applianceId) => {
    if (!window.confirm("Remove this appliance?")) return;
    await dispatch(deleteSingleAppliance(applianceId));
    showSuccess("Appliance removed.");
    dispatch(getApplianceProfile());
  };

  const handleEdit = (appliance) => {
    setEditingId(appliance._id);
    setEditData({
      quantity:    appliance.quantity,
      hoursPerDay: appliance.hoursPerDay,
      wattage:     appliance.wattage,
      starRating:  appliance.starRating || "",
    });
  };

  const handleSaveEdit = async (applianceId) => {
    await dispatch(updateSingleAppliance({
      applianceId,
      data: {
        quantity:    Number(editData.quantity),
        hoursPerDay: Number(editData.hoursPerDay),
        wattage:     Number(editData.wattage),
        starRating:  editData.starRating
          ? Number(editData.starRating) : null,
      },
    }));
    setEditingId(null);
    showSuccess("Appliance updated!");
    dispatch(getApplianceProfile());
  };

  const totalMonthlyKwh = profile?.appliances?.reduce(
    (sum, a) => sum + (a.wattage * a.quantity * a.hoursPerDay * 30) / 1000, 0
  ) || 0;

  return (
    <div className="dash-page" style={{ maxWidth: "900px" }}>

      {/* ── Header ── */}
      <div className="dash-header">
        <div>
          <h2>⚡ My Appliances</h2>
          <p style={{ color: "#64748b" }}>
            Add appliances you actually use — more accurate = better savings tips
          </p>
        </div>
        <button
          className="dash-upload-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add Appliance
        </button>
      </div>

      {/* ── Consumer Type ── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        {CONSUMER_TYPES.map((type) => (
          <button
            key={type.key}
            onClick={() => setConsumerType(type.key)}
            style={{
              padding: "10px 20px",
              border: consumerType === type.key
                ? "2px solid #22c55e" : "2px solid #e2e8f0",
              borderRadius: "10px",
              background: consumerType === type.key ? "#f0fdf4" : "#fff",
              cursor: "pointer", fontFamily: "inherit",
              fontWeight: consumerType === type.key ? 700 : 400,
              color: consumerType === type.key ? "#16a34a" : "#64748b",
            }}
          >
            {type.icon} {type.label}
          </button>
        ))}
      </div>

      {/* ── Alerts ── */}
      {successMsg && (
        <div className="alert-strip success" style={{ marginBottom: "16px" }}>
          ✅ {successMsg}
        </div>
      )}
      {error && (
        <div className="alert-strip danger" style={{ marginBottom: "16px" }}>
          ❌ {error}
        </div>
      )}

      {/* ── Add Form Modal ── */}
      {showAddForm && (
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: "16px", padding: "24px",
          marginBottom: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ margin: 0 }}>Add Appliance</h3>
            <button
              onClick={() => setShowAddForm(false)}
              style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}
            >
              ×
            </button>
          </div>

          {/* Common appliance picker */}
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8",
            textTransform: "uppercase", marginBottom: "10px" }}>
            Quick Select
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
            {COMMON_APPLIANCES.map((a) => (
              <button
                key={a.name}
                onClick={() => handleSelectCommon(a)}
                style={{
                  padding: "7px 14px",
                  border: newAppliance.name === a.name
                    ? "2px solid #22c55e" : "1.5px solid #e2e8f0",
                  borderRadius: "99px", background: newAppliance.name === a.name
                    ? "#f0fdf4" : "#f8fafc",
                  cursor: "pointer", fontSize: "13px", fontFamily: "inherit",
                  color: newAppliance.name === a.name ? "#16a34a" : "#475569",
                  fontWeight: newAppliance.name === a.name ? 700 : 400,
                }}
              >
                {a.icon} {a.name}
              </button>
            ))}
            <button
              onClick={() => { setCustomName(true); setNewAppliance(p => ({ ...p, name: "", icon: "🔌" })); }}
              style={{
                padding: "7px 14px",
                border: customName ? "2px solid #3b82f6" : "1.5px solid #e2e8f0",
                borderRadius: "99px", background: customName ? "#eff6ff" : "#f8fafc",
                cursor: "pointer", fontSize: "13px", fontFamily: "inherit",
                color: customName ? "#1d4ed8" : "#475569",
              }}
            >
              + Custom
            </button>
          </div>

          {/* Form fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

            {customName && (
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>
                  Appliance Name
                </label>
                <input
                  value={newAppliance.name}
                  onChange={(e) => setNewAppliance(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Air Cooler"
                  style={{
                    width: "100%", padding: "10px 12px",
                    border: "1.5px solid #e2e8f0", borderRadius: "8px",
                    fontSize: "14px", fontFamily: "inherit", outline: "none",
                  }}
                />
              </div>
            )}

            {[
              { label: "Wattage (W)",    key: "wattage",     type: "number", placeholder: "e.g. 1500" },
              { label: "Quantity",       key: "quantity",    type: "number", placeholder: "e.g. 1"    },
              { label: "Hours/Day",      key: "hoursPerDay", type: "number", placeholder: "e.g. 8"    },
              { label: "Star Rating (1-5)", key: "starRating", type: "number", placeholder: "Optional" },
            ].map((field) => (
              <div key={field.key}>
                <label style={{
                  fontSize: "12px", fontWeight: 700,
                  color: "#374151", display: "block", marginBottom: "6px",
                }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={newAppliance[field.key]}
                  onChange={(e) => setNewAppliance(p => ({ ...p, [field.key]: e.target.value }))}
                  min={field.key === "starRating" ? 1 : 0}
                  max={field.key === "starRating" ? 5 : undefined}
                  style={{
                    width: "100%", padding: "10px 12px",
                    border: "1.5px solid #e2e8f0", borderRadius: "8px",
                    fontSize: "14px", fontFamily: "inherit", outline: "none",
                  }}
                />
              </div>
            ))}
          </div>

          {newAppliance.name && newAppliance.wattage && (
            <div style={{
              marginTop: "16px", padding: "10px 14px",
              background: "#f0fdf4", borderRadius: "8px",
              border: "1px solid #86efac", fontSize: "13px", color: "#15803d",
            }}>
              📊 Est. monthly: <strong>
                {((Number(newAppliance.wattage) * Number(newAppliance.quantity || 1) *
                  Number(newAppliance.hoursPerDay || 1) * 30) / 1000).toFixed(1)} kWh
              </strong>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
            <button
              onClick={handleAddAppliance}
              disabled={!newAppliance.name || !newAppliance.wattage || loading}
              className="auth-submit-btn"
              style={{ flex: 1, padding: "12px" }}
            >
              {loading ? "Adding..." : "Add Appliance"}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                padding: "12px 20px", border: "1.5px solid #e2e8f0",
                borderRadius: "8px", background: "#fff",
                cursor: "pointer", fontFamily: "inherit", color: "#64748b",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Appliance List ── */}
      {!profile?.appliances?.length ? (
        <div className="dash-empty">
          <div className="dash-empty-icon" style={{ fontSize: "48px" }}>🔌</div>
          <h3>No appliances added yet</h3>
          <p>Add your household appliances to get personalized energy insights.</p>
          <button className="dash-upload-btn-lg" onClick={() => setShowAddForm(true)}>
            + Add Your First Appliance
          </button>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div style={{
            background: "#0f172a", borderRadius: "12px",
            padding: "14px 22px", display: "flex",
            gap: "24px", marginBottom: "20px", flexWrap: "wrap",
          }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
              <span style={{ color: "#22c55e", fontWeight: 700 }}>
                {profile.appliances.length}
              </span> appliances
            </span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
              Est. <span style={{ color: "#22c55e", fontWeight: 700 }}>
                {totalMonthlyKwh.toFixed(0)} kWh
              </span>/month
            </span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
              Type: <span style={{ color: "#fff", fontWeight: 600 }}>
                {profile.consumerType}
              </span>
            </span>
          </div>

          {/* Appliance cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {profile.appliances.map((appliance) => {
              const monthlyKwh = parseFloat(
                ((appliance.wattage * appliance.quantity *
                  appliance.hoursPerDay * 30) / 1000).toFixed(1)
              );
              const isEditing = editingId === appliance._id;

              return (
                <div
                  key={appliance._id}
                  style={{
                    background: "#fff", border: "1px solid #e2e8f0",
                    borderRadius: "14px", padding: "18px 20px",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {isEditing ? (
                    /* Edit mode */
                    <div>
                      <div style={{ display: "flex", alignItems: "center",
                        gap: "10px", marginBottom: "14px" }}>
                        <span style={{ fontSize: "24px" }}>{appliance.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: "15px" }}>
                          {appliance.name}
                        </span>
                      </div>
                      <div style={{ display: "grid",
                        gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
                        {[
                          { label: "Qty",       key: "quantity"    },
                          { label: "Hrs/Day",   key: "hoursPerDay" },
                          { label: "Watt",      key: "wattage"     },
                          { label: "Stars",     key: "starRating"  },
                        ].map((f) => (
                          <div key={f.key}>
                            <label style={{ fontSize: "11px", fontWeight: 700,
                              color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                              {f.label}
                            </label>
                            <input
                              type="number"
                              value={editData[f.key]}
                              onChange={(e) => setEditData(p =>
                                ({ ...p, [f.key]: e.target.value })
                              )}
                              style={{
                                width: "100%", padding: "8px",
                                border: "1.5px solid #e2e8f0",
                                borderRadius: "8px", fontSize: "14px",
                                fontFamily: "inherit", outline: "none",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                        <button
                          onClick={() => handleSaveEdit(appliance._id)}
                          style={{
                            padding: "8px 18px", background: "#22c55e",
                            color: "#fff", border: "none", borderRadius: "8px",
                            cursor: "pointer", fontFamily: "inherit", fontWeight: 700,
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            padding: "8px 14px", background: "#f1f5f9",
                            border: "none", borderRadius: "8px",
                            cursor: "pointer", fontFamily: "inherit",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div style={{ display: "flex", alignItems: "center",
                      justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>

                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <span style={{ fontSize: "28px" }}>{appliance.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>
                            {appliance.name}
                          </div>
                          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px" }}>
                            {appliance.quantity} unit · {appliance.hoursPerDay} hrs/day ·{" "}
                            {appliance.wattage}W
                            {appliance.starRating && ` · ${"⭐".repeat(appliance.starRating)}`}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: "#22c55e" }}>
                            {monthlyKwh} kWh
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                            /month est.
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => handleEdit(appliance)}
                            style={{
                              padding: "7px 14px", background: "#eff6ff",
                              color: "#1d4ed8", border: "none", borderRadius: "8px",
                              cursor: "pointer", fontFamily: "inherit",
                              fontSize: "12px", fontWeight: 700,
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(appliance._id)}
                            style={{
                              padding: "7px 14px", background: "#fef2f2",
                              color: "#ef4444", border: "none", borderRadius: "8px",
                              cursor: "pointer", fontFamily: "inherit",
                              fontSize: "12px", fontWeight: 700,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer actions */}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                padding: "12px 24px", border: "2px dashed #e2e8f0",
                borderRadius: "10px", background: "#f8fafc",
                cursor: "pointer", fontFamily: "inherit",
                color: "#64748b", fontWeight: 600, fontSize: "14px",
              }}
            >
              + Add More Appliances
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="auth-submit-btn"
              style={{ flex: 1, padding: "12px" }}
            >
              View My Dashboard →
            </button>
          </div>
        </>
      )}
    </div>
  );
}