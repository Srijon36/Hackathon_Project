import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveApplianceProfile, getApplianceProfile } from "../Reducer/ApplianceSlice";
import { useNavigate } from "react-router-dom";

// ── Appliance templates per consumer type ──────
const APPLIANCE_TEMPLATES = {
  domestic: [
    { name: "Air Conditioner",  icon: "❄️",  wattage: 1500, quantity: 1, hoursPerDay: 8  },
    { name: "Refrigerator",     icon: "🧊",  wattage: 150,  quantity: 1, hoursPerDay: 24 },
    { name: "Television",       icon: "📺",  wattage: 100,  quantity: 1, hoursPerDay: 6  },
    { name: "Washing Machine",  icon: "🫧",  wattage: 500,  quantity: 1, hoursPerDay: 1  },
    { name: "Fan",              icon: "🌀",  wattage: 75,   quantity: 3, hoursPerDay: 12 },
    { name: "LED Bulbs",        icon: "💡",  wattage: 10,   quantity: 8, hoursPerDay: 8  },
    { name: "Water Heater",     icon: "🚿",  wattage: 2000, quantity: 1, hoursPerDay: 1  },
    { name: "Microwave",        icon: "📡",  wattage: 1000, quantity: 1, hoursPerDay: 0.5},
  ],
  commercial: [
    { name: "Air Conditioner",  icon: "❄️",  wattage: 2000, quantity: 2, hoursPerDay: 10 },
    { name: "Computers",        icon: "💻",  wattage: 200,  quantity: 5, hoursPerDay: 9  },
    { name: "Printers",         icon: "🖨️",  wattage: 400,  quantity: 2, hoursPerDay: 4  },
    { name: "LED Lights",       icon: "💡",  wattage: 20,   quantity: 20, hoursPerDay: 10},
    { name: "Refrigerator",     icon: "🧊",  wattage: 200,  quantity: 1, hoursPerDay: 24 },
    { name: "CCTV Cameras",     icon: "📷",  wattage: 15,   quantity: 4, hoursPerDay: 24 },
    { name: "Servers",          icon: "🖥️",  wattage: 500,  quantity: 1, hoursPerDay: 24 },
    { name: "Water Dispenser",  icon: "💧",  wattage: 500,  quantity: 1, hoursPerDay: 8  },
  ],
  industrial: [
    { name: "Electric Motors",  icon: "⚙️",  wattage: 5000, quantity: 3, hoursPerDay: 12 },
    { name: "Air Compressor",   icon: "🔧",  wattage: 3000, quantity: 1, hoursPerDay: 8  },
    { name: "Welding Machine",  icon: "🔥",  wattage: 4000, quantity: 2, hoursPerDay: 6  },
    { name: "HVAC System",      icon: "🌬️",  wattage: 8000, quantity: 1, hoursPerDay: 10 },
    { name: "Industrial Lights",icon: "💡",  wattage: 400,  quantity: 10, hoursPerDay: 12},
    { name: "Conveyor Belt",    icon: "🏭",  wattage: 2000, quantity: 2, hoursPerDay: 8  },
    { name: "Exhaust Fans",     icon: "🌀",  wattage: 200,  quantity: 4, hoursPerDay: 12 },
    { name: "Water Pump",       icon: "💧",  wattage: 1500, quantity: 2, hoursPerDay: 6  },
  ],
};

const CONSUMER_TYPES = [
  { key: "domestic",   label: "Domestic",   icon: "🏠", desc: "Home / Household"       },
  { key: "commercial", label: "Commercial", icon: "🏢", desc: "Shop / Office / Hotel"   },
  { key: "industrial", label: "Industrial", icon: "🏭", desc: "Factory / Manufacturing" },
];

const ApplianceForm = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading, error, saved, profile } = useSelector((s) => s.appliance);

  const [consumerType, setConsumerType] = useState("domestic");
  const [appliances,   setAppliances]   = useState(
    APPLIANCE_TEMPLATES["domestic"]
  );
  const [successMsg, setSuccessMsg] = useState("");

  // Load existing profile if any
  useEffect(() => {
    dispatch(getApplianceProfile());
  }, [dispatch]);

  // Populate form if profile exists
  useEffect(() => {
    if (profile) {
      setConsumerType(profile.consumerType);
      setAppliances(profile.appliances);
    }
  }, [profile]);

  // When consumer type changes reset to template
  const handleTypeChange = (type) => {
    setConsumerType(type);
    setAppliances(APPLIANCE_TEMPLATES[type]);
  };

  // Update a field for one appliance
  const handleChange = (index, field, value) => {
    setAppliances((prev) =>
      prev.map((a, i) =>
        i === index ? { ...a, [field]: parseFloat(value) || value } : a
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      saveApplianceProfile({ consumerType, appliances })
    );
    if (saveApplianceProfile.fulfilled.match(result)) {
      setSuccessMsg("Appliance profile saved!");
      setTimeout(() => navigate("/upload"), 1500);
    }
  };

  return (
    <div className="dash-page" style={{ maxWidth: "860px" }}>

      {/* ── Header ── */}
      <div className="dash-header">
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>
            ⚡ Appliance Profile
          </h2>
          <p style={{ color: "#64748b", marginTop: "4px" }}>
            Tell us what appliances you use — we'll calculate accurate cost breakdowns
          </p>
        </div>
      </div>

      {/* ── Consumer Type Selector ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3,1fr)",
        gap: "14px", marginBottom: "32px",
      }}>
        {CONSUMER_TYPES.map((type) => (
          <button
            key={type.key}
            type="button"
            onClick={() => handleTypeChange(type.key)}
            style={{
              padding: "20px",
              border: consumerType === type.key
                ? "2px solid #22c55e" : "2px solid #e2e8f0",
              borderRadius: "16px",
              background: consumerType === type.key ? "#f0fdf4" : "#fff",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s",
              boxShadow: consumerType === type.key
                ? "0 0 0 4px rgba(34,197,94,0.1)" : "none",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>{type.icon}</div>
            <div style={{
              fontWeight: 800, fontSize: "15px",
              color: consumerType === type.key ? "#16a34a" : "#0f172a",
            }}>
              {type.label}
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
              {type.desc}
            </div>
          </button>
        ))}
      </div>

      {/* ── Success / Error ── */}
      {successMsg && (
        <div className="alert-strip success" style={{ marginBottom: "20px" }}>
          ✅ {successMsg}
        </div>
      )}
      {error && (
        <div className="alert-strip danger" style={{ marginBottom: "20px" }}>
          ❌ {error}
        </div>
      )}

      {/* ── Appliance Table ── */}
      <form onSubmit={handleSubmit}>
        <div className="chart-card">
          <h3 style={{
            fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: ".1em", color: "#6b8876",
            marginBottom: "20px", paddingBottom: "14px",
            borderBottom: "1px solid #e2ede6",
          }}>
            🔌 Your Appliances — {consumerType.charAt(0).toUpperCase() + consumerType.slice(1)}
          </h3>

          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 80px 100px 100px 80px",
            gap: "10px", padding: "8px 0",
            borderBottom: "2px solid #e2ede6",
            marginBottom: "8px",
          }}>
            {["Appliance", "Qty", "Hrs/Day", "Watt", "Est. kWh/mo"].map((h) => (
              <div key={h} style={{
                fontSize: "10px", fontWeight: 700,
                textTransform: "uppercase", color: "#94a3b8",
                letterSpacing: ".06em",
              }}>
                {h}
              </div>
            ))}
          </div>

          {/* Appliance rows */}
          {appliances.map((appliance, index) => {
            const monthlyKwh = parseFloat(
              ((appliance.wattage * appliance.quantity * appliance.hoursPerDay * 30) / 1000).toFixed(1)
            );
            return (
              <div
                key={appliance.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 80px 100px 100px 80px",
                  gap: "10px", alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid #f0f4f1",
                }}
              >
                {/* Name */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "22px" }}>{appliance.icon}</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
                    {appliance.name}
                  </span>
                </div>

                {/* Quantity */}
                <input
                  type="number" min="0" max="50"
                  value={appliance.quantity}
                  onChange={(e) => handleChange(index, "quantity", e.target.value)}
                  style={{
                    width: "100%", padding: "7px 10px",
                    border: "1.5px solid #e2ede6", borderRadius: "8px",
                    fontSize: "14px", fontWeight: 600,
                    textAlign: "center", outline: "none",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#22c55e"}
                  onBlur={(e)  => e.target.style.borderColor = "#e2ede6"}
                />

                {/* Hours per day */}
                <input
                  type="number" min="0" max="24" step="0.5"
                  value={appliance.hoursPerDay}
                  onChange={(e) => handleChange(index, "hoursPerDay", e.target.value)}
                  style={{
                    width: "100%", padding: "7px 10px",
                    border: "1.5px solid #e2ede6", borderRadius: "8px",
                    fontSize: "14px", fontWeight: 600,
                    textAlign: "center", outline: "none",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#22c55e"}
                  onBlur={(e)  => e.target.style.borderColor = "#e2ede6"}
                />

                {/* Wattage */}
                <input
                  type="number" min="0"
                  value={appliance.wattage}
                  onChange={(e) => handleChange(index, "wattage", e.target.value)}
                  style={{
                    width: "100%", padding: "7px 10px",
                    border: "1.5px solid #e2ede6", borderRadius: "8px",
                    fontSize: "14px", fontWeight: 600,
                    textAlign: "center", outline: "none",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#22c55e"}
                  onBlur={(e)  => e.target.style.borderColor = "#e2ede6"}
                />

                {/* Monthly kWh estimate */}
                <div style={{
                  fontSize: "13px", fontWeight: 700,
                  color: "#22c55e", textAlign: "center",
                }}>
                  {monthlyKwh}
                </div>
              </div>
            );
          })}

          {/* Total estimated kWh */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginTop: "16px",
            padding: "14px 16px",
            background: "#f0fdf4", borderRadius: "12px",
            border: "1px solid #86efac",
          }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#15803d" }}>
              📊 Total Estimated Monthly Consumption
            </span>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#16a34a" }}>
              {appliances.reduce((sum, a) =>
                sum + parseFloat(((a.wattage * a.quantity * a.hoursPerDay * 30) / 1000).toFixed(1)), 0
              ).toFixed(1)} kWh
            </span>
          </div>
        </div>

        {/* ── Submit ── */}
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            type="button"
            onClick={() => navigate("/upload")}
            style={{
              padding: "14px 28px", border: "1.5px solid #e2e8f0",
              borderRadius: "10px", background: "#fff",
              fontSize: "14px", fontWeight: 600,
              cursor: "pointer", color: "#64748b",
              fontFamily: "inherit",
            }}
          >
            Skip for now
          </button>
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            style={{ flex: 1, padding: "14px" }}
          >
            {loading ? "Saving..." : "Save & Continue to Upload →"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplianceForm;