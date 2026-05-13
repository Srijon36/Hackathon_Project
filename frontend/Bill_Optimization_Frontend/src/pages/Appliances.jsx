import { useState } from "react";
import { useDispatch } from "react-redux";
import { saveApplianceProfile } from "../Reducer/ApplianceSlice";
import { useNavigate } from "react-router-dom";

// ── Domestic appliances ────────────────────────────────────────────────────
const DOMESTIC_CATEGORIES = [
  {
    category: "Cooling & Heating", icon: "🌡️",
    items: [
      { name: "Air Conditioner",       icon: "❄️",  wattage: 1500 },
      { name: "Ceiling Fan",           icon: "🌀",  wattage: 75   },
      { name: "Table Fan",             icon: "💨",  wattage: 50   },
      { name: "Exhaust Fan",           icon: "🔄",  wattage: 40   },
      { name: "Air Cooler",            icon: "🧊",  wattage: 200  },
      { name: "Room Heater",           icon: "🔥",  wattage: 1500 },
      { name: "Air Purifier",          icon: "🌬️",  wattage: 50   },
      { name: "Humidifier",            icon: "💧",  wattage: 30   },
    ],
  },
  {
    category: "Kitchen", icon: "🍳",
    items: [
      { name: "Refrigerator",          icon: "🧊",  wattage: 150  },
      { name: "Microwave",             icon: "📡",  wattage: 1000 },
      { name: "Electric Kettle",       icon: "☕",  wattage: 1500 },
      { name: "Mixer / Grinder",       icon: "🌀",  wattage: 750  },
      { name: "Toaster",               icon: "🍞",  wattage: 800  },
      { name: "Induction Cooktop",     icon: "🍲",  wattage: 2000 },
      { name: "Oven / OTG",            icon: "🥧",  wattage: 1200 },
      { name: "Dishwasher",            icon: "🫧",  wattage: 1200 },
      { name: "Water Purifier",        icon: "💧",  wattage: 60   },
      { name: "Coffee Maker",          icon: "☕",  wattage: 900  },
      { name: "Rice Cooker",           icon: "🍚",  wattage: 400  },
      { name: "Deep Freezer",          icon: "🧊",  wattage: 200  },
    ],
  },
  {
    category: "Entertainment", icon: "📺",
    items: [
      { name: "Television",            icon: "📺",  wattage: 100  },
      { name: "Set-top Box",           icon: "📦",  wattage: 30   },
      { name: "Gaming Console",        icon: "🎮",  wattage: 150  },
      { name: "Home Theatre",          icon: "🔊",  wattage: 200  },
      { name: "Soundbar",              icon: "🎵",  wattage: 50   },
      { name: "Projector",             icon: "🎬",  wattage: 300  },
    ],
  },
  {
    category: "Computers & Office", icon: "💻",
    items: [
      { name: "Laptop",                icon: "💻",  wattage: 65   },
      { name: "Desktop PC",            icon: "🖥️",  wattage: 300  },
      { name: "Monitor",               icon: "🖥️",  wattage: 30   },
      { name: "WiFi Router",           icon: "📶",  wattage: 10   },
      { name: "Printer",               icon: "🖨️",  wattage: 400  },
      { name: "Scanner",               icon: "📋",  wattage: 15   },
      { name: "UPS / Inverter",        icon: "🔋",  wattage: 600  },
    ],
  },
  {
    category: "Laundry & Cleaning", icon: "🫧",
    items: [
      { name: "Washing Machine",       icon: "🫧",  wattage: 500  },
      { name: "Clothes Dryer",         icon: "♨️",  wattage: 4000 },
      { name: "Iron",                  icon: "👔",  wattage: 1000 },
      { name: "Vacuum Cleaner",        icon: "🌀",  wattage: 800  },
      { name: "Wet Grinder",           icon: "⚙️",  wattage: 150  },
    ],
  },
  {
    category: "Water & Lighting", icon: "💡",
    items: [
      { name: "Water Heater (Geyser)", icon: "🚿",  wattage: 2000 },
      { name: "Water Pump",            icon: "💧",  wattage: 750  },
      { name: "LED Bulbs",             icon: "💡",  wattage: 10   },
      { name: "Tube Lights",           icon: "🔆",  wattage: 36   },
      { name: "Outdoor Lights",        icon: "🏮",  wattage: 25   },
      { name: "Night Lamp",            icon: "🌙",  wattage: 5    },
    ],
  },
  {
    category: "Personal Care", icon: "🪥",
    items: [
      { name: "Hair Dryer",            icon: "💇",  wattage: 1200 },
      { name: "Electric Shaver",       icon: "🪒",  wattage: 15   },
      { name: "Hair Straightener",     icon: "✨",  wattage: 50   },
      { name: "Electric Toothbrush",   icon: "🪥",  wattage: 4    },
    ],
  },
];

// ── Commercial appliances ──────────────────────────────────────────────────
const COMMERCIAL_CATEGORIES = [
  {
    category: "HVAC & Climate", icon: "🌡️",
    items: [
      { name: "Central AC Unit",          icon: "❄️",  wattage: 5000  },
      { name: "Split AC (Commercial)",    icon: "🌬️",  wattage: 2500  },
      { name: "Cassette AC",              icon: "❄️",  wattage: 3500  },
      { name: "Industrial Exhaust Fan",   icon: "🔄",  wattage: 370   },
      { name: "Air Handling Unit (AHU)", icon: "💨",  wattage: 7500  },
      { name: "Chiller Unit",             icon: "🧊",  wattage: 15000 },
      { name: "Cooling Tower",            icon: "🏗️",  wattage: 5000  },
      { name: "Dehumidifier",             icon: "💧",  wattage: 800   },
    ],
  },
  {
    category: "Kitchen & Catering", icon: "🍳",
    items: [
      { name: "Commercial Refrigerator",  icon: "🧊",  wattage: 600   },
      { name: "Walk-in Cooler",           icon: "🥶",  wattage: 3000  },
      { name: "Commercial Oven",          icon: "🔥",  wattage: 5000  },
      { name: "Deep Fryer",               icon: "🍟",  wattage: 3000  },
      { name: "Commercial Dishwasher",    icon: "🫧",  wattage: 3500  },
      { name: "Industrial Mixer",         icon: "🌀",  wattage: 1500  },
      { name: "Coffee Machine (Pro)",     icon: "☕",  wattage: 2500  },
      { name: "Microwave (Commercial)",   icon: "📡",  wattage: 1800  },
      { name: "Food Warmer / Bain Marie", icon: "🍲",  wattage: 2000  },
      { name: "Ice Machine",              icon: "🧊",  wattage: 1200  },
      { name: "Exhaust Hood",             icon: "🌬️",  wattage: 750   },
      { name: "Bread Slicer",             icon: "🍞",  wattage: 300   },
    ],
  },
  {
    category: "IT & Networking", icon: "💻",
    items: [
      { name: "Server Rack",              icon: "🖥️",  wattage: 5000  },
      { name: "Network Switch",           icon: "📶",  wattage: 150   },
      { name: "UPS System",               icon: "🔋",  wattage: 2000  },
      { name: "Workstation PC",           icon: "🖥️",  wattage: 500   },
      { name: "Laser Printer",            icon: "🖨️",  wattage: 1200  },
      { name: "CCTV System",              icon: "📷",  wattage: 200   },
      { name: "Access Control System",    icon: "🔐",  wattage: 100   },
      { name: "Video Conferencing Unit",  icon: "📹",  wattage: 300   },
    ],
  },
  {
    category: "Office Equipment", icon: "🏢",
    items: [
      { name: "Photocopier / MFP",        icon: "📋",  wattage: 1500  },
      { name: "Shredder",                 icon: "📄",  wattage: 400   },
      { name: "POS Terminal",             icon: "💳",  wattage: 60    },
      { name: "Projector (Conference)",   icon: "🎬",  wattage: 400   },
      { name: "Digital Signage Display",  icon: "📺",  wattage: 300   },
      { name: "Electric Water Dispenser", icon: "💧",  wattage: 500   },
      { name: "Reception Desk Lighting",  icon: "💡",  wattage: 200   },
      { name: "Electric Stapler",         icon: "📌",  wattage: 30    },
    ],
  },
  {
    category: "Lighting & Power", icon: "💡",
    items: [
      { name: "LED Panel Lights",         icon: "💡",  wattage: 40    },
      { name: "High Bay LED",             icon: "🔆",  wattage: 150   },
      { name: "Emergency Exit Lighting",  icon: "🚨",  wattage: 10    },
      { name: "Outdoor Signage Light",    icon: "🏮",  wattage: 200   },
      { name: "EV Charger",               icon: "🔌",  wattage: 7200  },
      { name: "Solar Inverter",           icon: "☀️",  wattage: 5000  },
      { name: "Generator (Standby)",      icon: "⚡",  wattage: 10000 },
      { name: "Power Distribution Unit",  icon: "🔋",  wattage: 500   },
    ],
  },
  {
    category: "Laundry & Housekeeping", icon: "🫧",
    items: [
      { name: "Commercial Washer",        icon: "🫧",  wattage: 2500  },
      { name: "Commercial Dryer",         icon: "♨️",  wattage: 5000  },
      { name: "Steam Iron (Industrial)",  icon: "♨️",  wattage: 2000  },
      { name: "Vacuum (Industrial)",      icon: "🌀",  wattage: 1200  },
      { name: "Floor Scrubber",           icon: "🧹",  wattage: 1800  },
      { name: "Carpet Cleaner",           icon: "🧺",  wattage: 1400  },
    ],
  },
  {
    category: "Security & Safety", icon: "🔒",
    items: [
      { name: "Fire Alarm System",        icon: "🚨",  wattage: 100   },
      { name: "Sprinkler Pump",           icon: "💦",  wattage: 3700  },
      { name: "PA / Intercom System",     icon: "📢",  wattage: 200   },
      { name: "Automatic Door",           icon: "🚪",  wattage: 250   },
      { name: "Elevator / Lift",          icon: "🛗",  wattage: 7500  },
      { name: "Escalator",                icon: "⬆️",  wattage: 5000  },
    ],
  },
];

// ── Industrial appliances ──────────────────────────────────────────────────
const INDUSTRIAL_CATEGORIES = [
  {
    category: "Motors & Drives", icon: "⚙️",
    items: [
      { name: "Induction Motor (Small)",   icon: "⚙️",  wattage: 3700   },
      { name: "Induction Motor (Medium)",  icon: "⚙️",  wattage: 15000  },
      { name: "Induction Motor (Large)",   icon: "⚙️",  wattage: 55000  },
      { name: "Variable Frequency Drive",  icon: "🔧",  wattage: 7500   },
      { name: "Servo Motor",               icon: "🤖",  wattage: 2000   },
      { name: "DC Motor",                  icon: "⚡",  wattage: 5000   },
      { name: "Gear Motor",                icon: "🔩",  wattage: 1500   },
    ],
  },
  {
    category: "Compressors & Pumps", icon: "🔧",
    items: [
      { name: "Air Compressor",            icon: "💨",  wattage: 7500   },
      { name: "Hydraulic Pump",            icon: "💧",  wattage: 11000  },
      { name: "Centrifugal Pump",          icon: "🌀",  wattage: 5500   },
      { name: "Vacuum Pump",               icon: "🔄",  wattage: 3700   },
      { name: "Boiler Feed Pump",          icon: "🔥",  wattage: 15000  },
      { name: "Cooling Water Pump",        icon: "🧊",  wattage: 7500   },
      { name: "Submersible Pump",          icon: "💧",  wattage: 3000   },
    ],
  },
  {
    category: "Heating & Furnaces", icon: "🔥",
    items: [
      { name: "Electric Arc Furnace",      icon: "🔥",  wattage: 500000 },
      { name: "Induction Furnace",         icon: "♨️",  wattage: 100000 },
      { name: "Industrial Boiler",         icon: "🏭",  wattage: 50000  },
      { name: "Heat Treatment Oven",       icon: "🥵",  wattage: 20000  },
      { name: "Infrared Heater",           icon: "🌡️",  wattage: 3000   },
      { name: "Electric Resistance Heater",icon: "🔆",  wattage: 10000  },
      { name: "Autoclave",                 icon: "🧫",  wattage: 15000  },
    ],
  },
  {
    category: "Machining & Fabrication", icon: "🏗️",
    items: [
      { name: "CNC Milling Machine",       icon: "🔧",  wattage: 15000  },
      { name: "CNC Lathe",                 icon: "⚙️",  wattage: 11000  },
      { name: "Welding Machine",           icon: "🔩",  wattage: 10000  },
      { name: "Plasma Cutter",             icon: "✂️",  wattage: 8000   },
      { name: "Laser Cutter",              icon: "🔆",  wattage: 12000  },
      { name: "Drill Press",               icon: "🔩",  wattage: 1500   },
      { name: "Grinder (Industrial)",      icon: "⚙️",  wattage: 3000   },
      { name: "Hydraulic Press",           icon: "🏗️",  wattage: 22000  },
      { name: "Injection Moulding Machine",icon: "🏭",  wattage: 30000  },
      { name: "3D Printer (Industrial)",   icon: "🖨️",  wattage: 5000   },
    ],
  },
  {
    category: "Material Handling", icon: "📦",
    items: [
      { name: "Conveyor Belt",             icon: "➡️",  wattage: 5500   },
      { name: "Overhead Crane",            icon: "🏗️",  wattage: 22000  },
      { name: "Forklift (Electric)",       icon: "🚜",  wattage: 10000  },
      { name: "Pallet Wrapper",            icon: "📦",  wattage: 750    },
      { name: "Industrial Lift",           icon: "🛗",  wattage: 7500   },
      { name: "Automated Storage System",  icon: "🏭",  wattage: 15000  },
      { name: "Roller Conveyor",           icon: "🔄",  wattage: 2200   },
    ],
  },
  {
    category: "HVAC & Utilities", icon: "🌡️",
    items: [
      { name: "Industrial Chiller",        icon: "🧊",  wattage: 50000  },
      { name: "Cooling Tower",             icon: "🏭",  wattage: 15000  },
      { name: "AHU (Industrial)",          icon: "💨",  wattage: 22000  },
      { name: "Industrial Exhaust",        icon: "🔄",  wattage: 5500   },
      { name: "Dust Collector",            icon: "🌀",  wattage: 7500   },
      { name: "Compressed Air Dryer",      icon: "💨",  wattage: 3000   },
      { name: "RO Water Plant",            icon: "💧",  wattage: 5000   },
    ],
  },
  {
    category: "Power & Electrical", icon: "⚡",
    items: [
      { name: "Diesel Generator",          icon: "⚡",  wattage: 100000 },
      { name: "Transformer",               icon: "🔋",  wattage: 50000  },
      { name: "Power Factor Controller",   icon: "📊",  wattage: 1000   },
      { name: "UPS (Industrial)",          icon: "🔋",  wattage: 20000  },
      { name: "Solar Power System",        icon: "☀️",  wattage: 50000  },
      { name: "Battery Energy Storage",    icon: "🔋",  wattage: 30000  },
      { name: "Switchgear Panel",          icon: "🔌",  wattage: 2000   },
    ],
  },
  {
    category: "Lighting & Safety", icon: "💡",
    items: [
      { name: "High Bay LED (Industrial)", icon: "💡",  wattage: 200    },
      { name: "Floodlight",                icon: "🔆",  wattage: 400    },
      { name: "Explosion-proof Light",     icon: "🚨",  wattage: 100    },
      { name: "Emergency Lighting",        icon: "🚨",  wattage: 30     },
      { name: "Fire Suppression System",   icon: "💦",  wattage: 5000   },
      { name: "PA / Alarm System",         icon: "📢",  wattage: 500    },
    ],
  },
];

// ── Map consumer type → category set ──────────────────────────────────────
const CATEGORIES_MAP = {
  domestic:   DOMESTIC_CATEGORIES,
  commercial: COMMERCIAL_CATEGORIES,
  industrial: INDUSTRIAL_CATEGORIES,
};

const CONSUMER_TYPES = [
  { key: "domestic",   label: "Domestic",   icon: "🏠" },
  { key: "commercial", label: "Commercial", icon: "🏢" },
  { key: "industrial", label: "Industrial", icon: "🏭" },
];

// ₹/kWh rates per type
const RATE_MAP = { domestic: 7, commercial: 9, industrial: 6.5 };

// Default hours/day by appliance name
const DEFAULT_HOURS = {
  "Air Conditioner": 8, "Ceiling Fan": 12, "Table Fan": 10,
  "Refrigerator": 24,  "Water Heater (Geyser)": 1, "Television": 6,
  "Laptop": 8,         "WiFi Router": 24, "LED Bulbs": 6,
  "Central AC Unit": 10, "Chiller Unit": 16,
  "Server Rack": 24,   "Conveyor Belt": 16,
  "Industrial Chiller": 20, "Diesel Generator": 8,
  default: 8,
};

// ── Color palette ──────────────────────────────────────────────────────────
const C = {
  bg:          "#f5f6fa",
  surface:     "#ffffff",
  surfaceAlt:  "#f0f2f8",
  border:      "#e2e6f0",
  text:        "#1a2035",
  textSub:     "#5a6480",
  textMuted:   "#9ba3ba",
  accent:      "#16a34a",
  accentLight: "#dcfce7",
  accentMid:   "#86efac",
  accentText:  "#15803d",
  yellow:      "#d97706",
  yellowLight: "#fef3c7",
  red:         "#dc2626",
  shadow:      "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowCard:  "0 2px 8px rgba(0,0,0,0.08)",
};

// ── Component ──────────────────────────────────────────────────────────────
export default function Appliances() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [consumerType,   setConsumerType]   = useState("domestic");
  const [selected,       setSelected]       = useState({});
  const [activeCategory, setActiveCategory] = useState(DOMESTIC_CATEGORIES[0].category);
  const [saving,         setSaving]         = useState(false);
  const [saved,          setSaved]          = useState(false);

  const currentCategories = CATEGORIES_MAP[consumerType];

  // Switch type → clear selections, jump to first category of new type
  const switchType = (type) => {
    setConsumerType(type);
    setSelected({});
    setActiveCategory(CATEGORIES_MAP[type][0].category);
  };

  const toggle = (appliance) => {
    setSelected((prev) => {
      if (prev[appliance.name]) {
        const next = { ...prev };
        delete next[appliance.name];
        return next;
      }
      return {
        ...prev,
        [appliance.name]: {
          ...appliance,
          quantity:    1,
          hoursPerDay: DEFAULT_HOURS[appliance.name] ?? DEFAULT_HOURS.default,
        },
      };
    });
  };

  const updateField = (name, field, value) => {
    setSelected((prev) => ({
      ...prev,
      [name]: { ...prev[name], [field]: Math.max(1, Number(value)) },
    }));
  };

  const selectedCount   = Object.keys(selected).length;
  const totalMonthlyKwh = Object.values(selected).reduce(
    (sum, a) => sum + (a.wattage * a.quantity * a.hoursPerDay * 30) / 1000, 0
  );
  const rate = RATE_MAP[consumerType];

  const handleSave = async () => {
    if (!selectedCount) return;
    setSaving(true);
    const appliances = Object.values(selected).map((a) => ({
      name:        a.name,
      icon:        a.icon,
      wattage:     a.wattage,
      quantity:    a.quantity,
      hoursPerDay: a.hoursPerDay,
      starRating:  null,
    }));
    await dispatch(saveApplianceProfile({ consumerType, appliances }));
    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate("/dashboard"), 1200);
  };

  // Resolve active category (guard after type switch)
  const activeCat =
    currentCategories.find((c) => c.category === activeCategory)
    ?? currentCategories[0];

  // Format wattage: show kW for ≥1000W
  const fmtWatt = (w) =>
    w >= 1000
      ? `${(w / 1000).toFixed(w % 1000 === 0 ? 0 : 1)} kW`
      : `${w}W`;

  const miniBtn = {
    width: "22px", height: "22px",
    background: C.surfaceAlt,
    border: `1px solid ${C.border}`,
    borderRadius: "6px",
    color: C.textSub,
    cursor: "pointer",
    fontSize: "14px", lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "inherit", padding: 0,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "0 0 80px",
    }}>

      {/* ── Top Bar ── */}
      <div style={{
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: "18px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: C.text, letterSpacing: "-0.4px" }}>
            ⚡ My Appliances
          </h1>
          <p style={{ margin: "3px 0 0", color: C.textMuted, fontSize: "13px" }}>
            Select appliances for your {consumerType} setup
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {CONSUMER_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => switchType(t.key)}
              style={{
                padding: "8px 18px",
                border: consumerType === t.key
                  ? `1.5px solid ${C.accent}`
                  : `1.5px solid ${C.border}`,
                borderRadius: "99px",
                background: consumerType === t.key ? C.accentLight : C.surface,
                color: consumerType === t.key ? C.accentText : C.textSub,
                cursor: "pointer", fontSize: "13px",
                fontWeight: consumerType === t.key ? 700 : 500,
                fontFamily: "inherit", transition: "all 0.15s",
                boxShadow: consumerType === t.key ? `0 0 0 3px ${C.accentLight}` : "none",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", padding: "24px 28px", gap: "22px" }}>

        {/* ── Left: Category Sidebar ── */}
        <div style={{ width: "240px", flexShrink: 0 }}>
          <p style={{
            fontSize: "10px", fontWeight: 700, color: C.textMuted,
            textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "12px",
          }}>
            Categories
          </p>
          {currentCategories.map((cat) => {
            const selInCat = cat.items.filter((i) => selected[i.name]).length;
            const isActive = cat.category === activeCategory;
            return (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(cat.category)}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "11px 14px", marginBottom: "4px",
                  border: isActive ? `1.5px solid ${C.accentMid}` : "1.5px solid transparent",
                  borderRadius: "11px",
                  background: isActive ? C.accentLight : "transparent",
                  color: isActive ? C.accentText : C.textSub,
                  cursor: "pointer", fontFamily: "inherit",
                  fontSize: "14px", fontWeight: isActive ? 700 : 500,
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px", lineHeight: 1 }}>{cat.icon}</span>
                  <span>{cat.category}</span>
                </span>
                {selInCat > 0 && (
                  <span style={{
                    background: C.accent, color: "#fff",
                    borderRadius: "99px", fontSize: "10px",
                    fontWeight: 800, padding: "1px 7px",
                  }}>
                    {selInCat}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Center: Appliance Grid ── */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{ fontSize: "24px" }}>{activeCat.icon}</span>
            <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: C.text }}>
              {activeCat.category}
            </h2>
            <span style={{
              fontSize: "11px", color: C.textMuted, fontWeight: 600,
              background: C.surfaceAlt, border: `1px solid ${C.border}`,
              padding: "2px 10px", borderRadius: "99px",
            }}>
              {activeCat.items.length} items
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(138px, 1fr))",
            gap: "10px",
          }}>
            {activeCat.items.map((appliance) => {
              const isSelected = !!selected[appliance.name];
              return (
                <button
                  key={appliance.name}
                  onClick={() => toggle(appliance)}
                  style={{
                    background:   isSelected ? C.accentLight : C.surface,
                    border:       isSelected ? `2px solid ${C.accent}` : `2px solid ${C.border}`,
                    borderRadius: "14px",
                    padding:      "18px 12px",
                    cursor:       "pointer",
                    textAlign:    "center",
                    transition:   "all 0.15s",
                    fontFamily:   "inherit",
                    position:     "relative",
                    transform:    isSelected ? "scale(1.03)" : "scale(1)",
                    boxShadow:    isSelected
                      ? `0 0 0 3px ${C.accentLight}, ${C.shadowCard}`
                      : C.shadowCard,
                  }}
                >
                  {isSelected && (
                    <span style={{
                      position: "absolute", top: "8px", right: "8px",
                      background: C.accent, color: "#fff",
                      borderRadius: "99px", fontSize: "10px",
                      fontWeight: 800, padding: "1px 6px",
                    }}>✓</span>
                  )}
                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>{appliance.icon}</div>
                  <div style={{
                    fontSize: "11px", fontWeight: 600,
                    color: isSelected ? C.accentText : C.text,
                    lineHeight: 1.3,
                  }}>
                    {appliance.name}
                  </div>
                  <div style={{
                    fontSize: "10px", fontWeight: 600,
                    color: isSelected ? C.accent : C.textMuted,
                    marginTop: "4px",
                  }}>
                    {fmtWatt(appliance.wattage)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: Selected Panel ── */}
        <div style={{ width: "260px", flexShrink: 0 }}>
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "16px", padding: "20px",
            position: "sticky", top: "24px",
            boxShadow: C.shadow,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <p style={{
                fontSize: "10px", fontWeight: 700, color: C.textMuted,
                textTransform: "uppercase", letterSpacing: "1.2px", margin: 0,
              }}>
                Selected
              </p>
              {selectedCount > 0 && (
                <span style={{
                  background: C.accentLight, color: C.accentText,
                  borderRadius: "99px", fontSize: "11px", fontWeight: 800,
                  padding: "2px 10px", border: `1px solid ${C.accentMid}`,
                }}>
                  {selectedCount}
                </span>
              )}
            </div>

            {selectedCount === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <div style={{ fontSize: "34px", marginBottom: "8px" }}>
                  {consumerType === "domestic" ? "🏠" : consumerType === "commercial" ? "🏢" : "🏭"}
                </div>
                <p style={{ fontSize: "12px", color: C.textMuted, margin: 0, lineHeight: 1.5 }}>
                  Tap appliances<br />to select them
                </p>
              </div>
            ) : (
              <div style={{ maxHeight: "330px", overflowY: "auto", marginRight: "-4px", paddingRight: "4px" }}>
                {Object.values(selected).map((a) => (
                  <div
                    key={a.name}
                    style={{
                      background: C.surfaceAlt,
                      border: `1px solid ${C.border}`,
                      borderRadius: "10px", padding: "10px 12px",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start",
                      justifyContent: "space-between", marginBottom: "8px", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: C.text, lineHeight: 1.4 }}>
                        {a.icon} {a.name}
                      </span>
                      <button
                        onClick={() => toggle(a)}
                        style={{
                          background: "#fff0f0", border: `1px solid #fecaca`,
                          color: C.red, borderRadius: "6px",
                          cursor: "pointer", fontSize: "13px",
                          lineHeight: 1, padding: "2px 6px",
                          fontFamily: "inherit", flexShrink: 0,
                        }}
                      >×</button>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "9px", fontWeight: 700,
                          color: C.textMuted, display: "block", marginBottom: "4px",
                          textTransform: "uppercase", letterSpacing: "0.8px" }}>Qty</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <button onClick={() => updateField(a.name, "quantity", a.quantity - 1)} style={miniBtn}>−</button>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: C.text,
                            minWidth: "18px", textAlign: "center" }}>{a.quantity}</span>
                          <button onClick={() => updateField(a.name, "quantity", a.quantity + 1)} style={miniBtn}>+</button>
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "9px", fontWeight: 700,
                          color: C.textMuted, display: "block", marginBottom: "4px",
                          textTransform: "uppercase", letterSpacing: "0.8px" }}>Hrs/Day</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <button onClick={() => updateField(a.name, "hoursPerDay", a.hoursPerDay - 1)} style={miniBtn}>−</button>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: C.text,
                            minWidth: "18px", textAlign: "center" }}>{a.hoursPerDay}</span>
                          <button onClick={() => updateField(a.name, "hoursPerDay", a.hoursPerDay + 1)} style={miniBtn}>+</button>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      marginTop: "7px", fontSize: "10px", fontWeight: 700,
                      color: C.accentText, background: C.accentLight,
                      borderRadius: "6px", padding: "3px 8px",
                      display: "inline-block",
                    }}>
                      ~{((a.wattage * a.quantity * a.hoursPerDay * 30) / 1000).toFixed(0)} kWh/mo
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {selectedCount > 0 && (
              <div style={{
                borderTop: `1px solid ${C.border}`,
                marginTop: "14px", paddingTop: "14px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  fontSize: "12px", color: C.textSub, marginBottom: "6px" }}>
                  <span>Total est./month</span>
                  <span style={{
                    color: C.accentText, fontWeight: 700,
                    background: C.accentLight, padding: "1px 8px",
                    borderRadius: "6px", fontSize: "11px",
                  }}>
                    {totalMonthlyKwh >= 1000
                      ? `${(totalMonthlyKwh / 1000).toFixed(1)} MWh`
                      : `${totalMonthlyKwh.toFixed(0)} kWh`}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between",
                  fontSize: "12px", color: C.textSub, marginBottom: "4px" }}>
                  <span>Approx. bill</span>
                  <span style={{
                    color: C.yellow, fontWeight: 700,
                    background: C.yellowLight, padding: "1px 8px",
                    borderRadius: "6px", fontSize: "11px",
                  }}>
                    ₹{(totalMonthlyKwh * rate).toLocaleString("en-IN", { maximumFractionDigits: 0 })}/mo
                  </span>
                </div>
                <div style={{ fontSize: "10px", color: C.textMuted, textAlign: "right" }}>
                  @ ₹{rate}/kWh ({consumerType} rate)
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!selectedCount || saving || saved}
              style={{
                width: "100%", marginTop: "16px",
                padding: "12px",
                background: saved
                  ? C.accent
                  : !selectedCount
                  ? C.surfaceAlt
                  : "linear-gradient(135deg, #22c55e, #16a34a)",
                border: !selectedCount ? `1px solid ${C.border}` : "none",
                borderRadius: "10px",
                color: !selectedCount ? C.textMuted : "#fff",
                fontFamily: "inherit", fontWeight: 700,
                fontSize: "14px", cursor: !selectedCount ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                boxShadow: !selectedCount ? "none" : "0 2px 12px rgba(22,163,74,0.3)",
                letterSpacing: "-0.2px",
              }}
            >
              {saved ? "✅ Saved!" : saving ? "Saving…" : `Save ${selectedCount} Appliance${selectedCount !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}