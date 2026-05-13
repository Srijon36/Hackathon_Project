import { useState } from "react";
import { useDispatch } from "react-redux";
import { saveApplianceProfile } from "../Reducer/ApplianceSlice";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";
const getToken = () => {
  const s = sessionStorage.getItem("energy_token");
  return s ? JSON.parse(s)?.token : null;
};

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

// Default hours/day by appliance name — realistic usage patterns
const DEFAULT_HOURS = {
  // ── Always-on / continuous ──────────────────────────────────
  "Refrigerator":              24,
  "WiFi Router":               24,
  "Server Rack":               24,
  "Deep Freezer":              24,
  "UPS / Inverter":            24,
  "UPS System":                24,
  "UPS (Industrial)":          24,
  "Fire Alarm System":         24,
  "CCTV System":               24,
  "Water Purifier":             6,

  // ── Cooling & fans (summer-heavy, avg across year) ──────────
  "Air Conditioner":            8,
  "Split AC (Commercial)":      8,
  "Central AC Unit":           10,
  "Cassette AC":                8,
  "Ceiling Fan":               12,
  "Table Fan":                 10,
  "Exhaust Fan":                4,
  "Air Cooler":                 8,
  "Air Handling Unit (AHU)":   12,
  "AHU (Industrial)":          12,
  "Chiller Unit":              16,
  "Industrial Chiller":        20,
  "Cooling Tower":             12,
  "Dehumidifier":               6,

  // ── Heating (winter-heavy, avg across year) ─────────────────
  "Water Heater (Geyser)":      1,
  "Room Heater":                3,
  "Electric Resistance Heater": 4,
  "Infrared Heater":            3,
  "Autoclave":                  4,

  // ── Entertainment ───────────────────────────────────────────
  "Television":                 6,
  "Set-top Box":                8,
  "Gaming Console":             2,
  "Home Theatre":               1,
  "Soundbar":                   2,
  "Projector":                 0.5,   // ← occasional
  "Projector (Conference)":     1,

  // ── Computers & office ──────────────────────────────────────
  "Laptop":                     8,
  "Desktop PC":                 8,
  "Monitor":                    8,
  "Workstation PC":             8,
  "Printer":                    1,
  "Laser Printer":              1,
  "Scanner":                   0.5,
  "Photocopier / MFP":          2,
  "Shredder":                  0.25,
  "Electric Stapler":          0.1,
  "POS Terminal":               8,
  "Video Conferencing Unit":    2,
  "Access Control System":     24,
  "Digital Signage Display":   10,

  // ── Kitchen — regular use ───────────────────────────────────
  "Microwave":                 0.25,
  "Induction Cooktop":          1,
  "Rice Cooker":               0.5,
  "Oven / OTG":                0.25,
  "Coffee Maker":              0.25,
  "Electric Kettle":           0.25,
  "Dishwasher":                0.5,
  "Water Dispenser":            2,
  "Electric Water Dispenser":   2,

  // ── Kitchen — occasional / quick use ────────────────────────
  "Mixer / Grinder":           0.25,  // ← occasional
  "Toaster":                   0.1,   // ← occasional
  "Commercial Oven":            6,
  "Commercial Dishwasher":      4,
  "Industrial Mixer":           4,
  "Coffee Machine (Pro)":       6,
  "Microwave (Commercial)":     4,
  "Food Warmer / Bain Marie":   8,
  "Ice Machine":               12,
  "Deep Fryer":                 5,
  "Exhaust Hood":               6,

  // ── Laundry — occasional ────────────────────────────────────
  "Washing Machine":           0.5,   // ← occasional
  "Clothes Dryer":             0.5,   // ← occasional
  "Iron":                      0.25,  // ← occasional (~15 min/day avg)
  "Vacuum Cleaner":            0.25,  // ← occasional
  "Wet Grinder":               0.25,
  "Hair Dryer":                0.1,   // ← occasional
  "Hair Straightener":         0.1,
  "Electric Shaver":           0.05,
  "Electric Toothbrush":       0.05,

  // ── Lighting ────────────────────────────────────────────────
  "LED Bulbs":                  6,
  "Tube Lights":                8,
  "Outdoor Lights":             8,
  "Night Lamp":                10,
  "LED Panel Lights":          10,
  "High Bay LED":              12,
  "High Bay LED (Industrial)": 12,
  "Emergency Exit Lighting":   24,
  "Floodlight":                 6,
  "Outdoor Signage Light":     10,
  "Reception Desk Lighting":   10,
  "Explosion-proof Light":     12,
  "Emergency Lighting":        24,

  // ── Water & utilities ───────────────────────────────────────
  "Water Pump":                 2,
  "Air Purifier":               6,
  "Humidifier":                 4,
  "Air Compressor":             6,
  "Submersible Pump":           2,
  "RO Water Plant":             8,

  // ── Industrial ──────────────────────────────────────────────
  "Conveyor Belt":             16,
  "Diesel Generator":           8,
  "Overhead Crane":             8,
  "Forklift (Electric)":        6,
  "CNC Milling Machine":       10,
  "CNC Lathe":                 10,
  "Welding Machine":            6,
  "Laser Cutter":               8,
  "Plasma Cutter":              6,
  "Drill Press":                4,
  "Hydraulic Press":            8,
  "Elevator / Lift":            8,
  "Escalator":                 12,
  "EV Charger":                 4,

  // ── Fallback ────────────────────────────────────────────────
  default: 2,   // sensible low default for unknown appliances
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

  // AI monthly prediction state
  const [predicting,    setPredicting]    = useState(false);
  const [prediction,    setPrediction]    = useState(null);
  const [predictError,  setPredictError]  = useState(null);
  const [showForecast,  setShowForecast]  = useState(false);

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
    setPrediction(null); // reset forecast on re-save
    setTimeout(() => navigate("/dashboard"), 1200);
  };

  const handlePredictMonthly = async () => {
    setPredicting(true);
    setPredictError(null);
    setPrediction(null);
    setShowForecast(true);
    try {
      const res  = await fetch(`${API_BASE}/appliances/predict-monthly`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setPrediction(data);
      } else {
        setPredictError(data.message || "Prediction failed.");
      }
    } catch {
      setPredictError("Network error. Is the backend running?");
    } finally {
      setPredicting(false);
    }
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

      {/* ── AI Monthly Forecast Panel ── */}
      {saved && (
        <div style={{ padding: "0 28px 48px" }}>
          <div style={{
            background: "#fff",
            border: `1px solid ${C.border}`,
            borderRadius: "18px",
            padding: "28px 32px",
            boxShadow: C.shadow,
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: C.text, letterSpacing: "-0.3px" }}>
                  🤖 AI Monthly Appliance Forecast
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: C.textMuted }}>
                  Claude AI predicts which appliances you'll actually use each month based on Indian seasonal patterns
                </p>
              </div>
              <button
                onClick={handlePredictMonthly}
                disabled={predicting}
                style={{
                  padding: "11px 24px",
                  background: predicting ? C.surfaceAlt : "linear-gradient(135deg, #22c55e, #16a34a)",
                  border: "none", borderRadius: "10px",
                  color: predicting ? C.textMuted : "#fff",
                  fontFamily: "inherit", fontWeight: 700, fontSize: "14px",
                  cursor: predicting ? "not-allowed" : "pointer",
                  boxShadow: predicting ? "none" : "0 3px 14px rgba(22,163,74,0.35)",
                  display: "flex", alignItems: "center", gap: "8px",
                  transition: "all 0.2s",
                }}
              >
                {predicting ? "⏳ Analysing…" : `✨ ${prediction ? "Refresh Forecast" : "Generate Forecast"}`}
              </button>
            </div>

            {/* Error */}
            {predictError && (
              <div style={{
                background: "#fff0f0", border: "1px solid #fecaca",
                borderRadius: "10px", padding: "12px 16px",
                color: "#b91c1c", fontSize: "13px", fontWeight: 600,
              }}>
                ❌ {predictError}
              </div>
            )}

            {/* Loading skeleton */}
            {predicting && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    height: "48px", borderRadius: "10px",
                    background: "linear-gradient(90deg, #f0f2f8 25%, #e8eaf0 50%, #f0f2f8 75%)",
                    backgroundSize: "400% 100%",
                    animation: "shimmerAnim 1.4s ease infinite",
                  }} />
                ))}
                <style>{`@keyframes shimmerAnim { 0%{background-position:100% 50%} 100%{background-position:0% 50%} }`}</style>
              </div>
            )}

            {/* Heatmap result */}
            {prediction && !predicting && (
              <>
                {/* Claude insight + rate badge */}
                <div style={{
                  background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                  border: "1px solid #86efac", borderRadius: "12px",
                  padding: "14px 18px", marginBottom: "8px",
                  fontSize: "13px", color: C.accentText, lineHeight: 1.65, fontWeight: 500,
                }}>
                  💡 {prediction.summaryInsight}
                </div>

                {/* Rate info bar */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  marginBottom: "18px", flexWrap: "wrap",
                }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    background: "#fef3c7", border: "1px solid #fde68a",
                    borderRadius: "99px", padding: "4px 12px",
                    fontSize: "11px", fontWeight: 700, color: "#92400e",
                  }}>
                    ⚡ Rate: ₹{prediction.ratePerUnit}/kWh ({prediction.consumerType})
                  </span>
                  <span style={{ fontSize: "11px", color: C.textMuted }}>
                    Hover over any cell for exact kWh details
                  </span>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "3px", minWidth: "880px" }}>
                    <thead>
                      <tr>
                        <th style={{
                          textAlign: "left", fontSize: "11px", fontWeight: 700, color: C.textMuted,
                          paddingBottom: "8px", paddingLeft: "4px", width: "175px",
                        }}>Appliance</th>
                        {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => (
                          <th key={m} style={{
                            textAlign: "center", fontSize: "10px", fontWeight: 700,
                            color: C.textMuted, paddingBottom: "8px", minWidth: "52px",
                          }}>{m}</th>
                        ))}
                        <th style={{
                          textAlign: "center", fontSize: "10px", fontWeight: 700,
                          color: "#92400e", paddingBottom: "8px", minWidth: "70px",
                          background: "#fffbeb", borderRadius: "8px",
                        }}>Annual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prediction.predictions.map((p) => {
                        const maxCost = Math.max(...p.months.map(m => m.costPerMonth), 1);
                        return (
                          <tr key={p.appliance}>
                            {/* Appliance name */}
                            <td style={{
                              fontSize: "12px", fontWeight: 600, color: C.text,
                              paddingRight: "8px", paddingBottom: "4px", whiteSpace: "nowrap",
                              verticalAlign: "middle",
                            }}>
                              {p.icon} {p.appliance}
                              <div style={{ fontSize: "10px", color: C.textMuted, fontWeight: 400 }}>
                                {p.wattage}W × {p.quantity}
                              </div>
                            </td>

                            {/* Monthly cells */}
                            {p.months.map((m) => {
                              const pct = m.costPerMonth / maxCost;
                              const bg = m.hoursPerDay === 0 ? "#f1f5f9"
                                : pct >= 0.8 ? "#16a34a"
                                : pct >= 0.5 ? "#4ade80"
                                : pct >= 0.2 ? "#bbf7d0"
                                : "#dcfce7";
                              const fg = pct >= 0.8 ? "#fff" : C.accentText;
                              const fgMuted = pct >= 0.8 ? "rgba(255,255,255,0.75)" : "#6b9e7a";
                              return (
                                <td key={m.month}
                                  title={`${p.appliance} — ${m.month}\nUsage: ${m.hoursPerDay} hrs/day\nkWh: ${m.kwhPerMonth} kWh\nCost: ₹${m.costPerMonth}`}
                                  style={{ textAlign: "center", paddingBottom: "4px", verticalAlign: "top" }}>
                                  <div style={{
                                    background: bg, borderRadius: "7px",
                                    padding: "5px 3px 4px",
                                    minWidth: "48px", cursor: "default",
                                    transition: "transform 0.1s",
                                  }}>
                                    {m.hoursPerDay === 0 ? (
                                      <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 2 }}>—</div>
                                    ) : (
                                      <>
                                        {/* Hours */}
                                        <div style={{
                                          fontSize: "11px", fontWeight: 800, color: fg,
                                          lineHeight: 1.2,
                                        }}>
                                          {m.hoursPerDay}h
                                        </div>
                                        {/* Cost */}
                                        <div style={{
                                          fontSize: "10px", fontWeight: 600, color: fgMuted,
                                          lineHeight: 1.3, marginTop: "2px",
                                        }}>
                                          ₹{m.costPerMonth}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </td>
                              );
                            })}

                            {/* Annual total cell */}
                            <td style={{ textAlign: "center", paddingBottom: "4px", verticalAlign: "top" }}>
                              <div style={{
                                background: "#fffbeb", border: "1px solid #fde68a",
                                borderRadius: "7px", padding: "5px 3px 4px",
                                minWidth: "64px",
                              }}>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: "#92400e", lineHeight: 1.2 }}>
                                  {p.annualKwh} kWh
                                </div>
                                <div style={{ fontSize: "11px", fontWeight: 700, color: "#d97706", lineHeight: 1.3, marginTop: "2px" }}>
                                  ₹{p.annualCost.toLocaleString("en-IN")}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Monthly totals row */}
                      <tr style={{ borderTop: `2px solid ${C.border}` }}>
                        <td style={{
                          fontSize: "11px", fontWeight: 800, color: C.text,
                          paddingTop: "8px", paddingRight: "8px", whiteSpace: "nowrap",
                        }}>
                          📊 Total / Month
                          <div style={{ fontSize: "10px", color: C.textMuted, fontWeight: 400 }}>All appliances</div>
                        </td>
                        {Array.from({ length: 12 }, (_, i) => {
                          const monthTotal = prediction.predictions.reduce(
                            (sum, p) => sum + (p.months[i]?.costPerMonth ?? 0), 0
                          );
                          const monthKwh = prediction.predictions.reduce(
                            (sum, p) => sum + (p.months[i]?.kwhPerMonth ?? 0), 0
                          );
                          const maxTotal = Math.max(
                            ...Array.from({ length: 12 }, (_, j) =>
                              prediction.predictions.reduce((s, p) => s + (p.months[j]?.costPerMonth ?? 0), 0)
                            ), 1
                          );
                          const pct = monthTotal / maxTotal;
                          return (
                            <td key={i}
                              title={`Month total: ${monthKwh.toFixed(1)} kWh · ₹${monthTotal}`}
                              style={{ textAlign: "center", paddingTop: "8px", verticalAlign: "top" }}>
                              <div style={{
                                background: pct >= 0.8 ? "#0f172a" : pct >= 0.5 ? "#1e293b" : "#334155",
                                borderRadius: "7px", padding: "5px 3px 4px",
                                minWidth: "48px",
                              }}>
                                <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", lineHeight: 1.2 }}>
                                  {parseFloat(monthKwh.toFixed(0))} kWh
                                </div>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: "#22c55e", lineHeight: 1.3, marginTop: "1px" }}>
                                  ₹{monthTotal.toLocaleString("en-IN")}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                        {/* Grand annual total */}
                        <td style={{ textAlign: "center", paddingTop: "8px", verticalAlign: "top" }}>
                          <div style={{
                            background: "#0f172a", border: "2px solid #22c55e",
                            borderRadius: "7px", padding: "5px 3px 4px",
                            minWidth: "64px",
                          }}>
                            <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", lineHeight: 1.2 }}>
                              {prediction.predictions.reduce((s, p) => s + p.annualKwh, 0).toFixed(0)} kWh
                            </div>
                            <div style={{ fontSize: "12px", fontWeight: 800, color: "#22c55e", lineHeight: 1.3, marginTop: "1px" }}>
                              ₹{prediction.predictions.reduce((s, p) => s + p.annualCost, 0).toLocaleString("en-IN")}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", color: C.textMuted, fontWeight: 600 }}>Cost intensity:</span>
                  {[
                    { bg: "#f1f5f9", label: "Off" },
                    { bg: "#dcfce7", label: "Low" },
                    { bg: "#bbf7d0", label: "Moderate" },
                    { bg: "#4ade80", label: "High" },
                    { bg: "#16a34a", label: "Peak" },
                  ].map(({ bg, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <div style={{ width: "16px", height: "16px", background: bg, borderRadius: "4px", border: "1px solid #e2e8f0" }} />
                      <span style={{ fontSize: "11px", color: C.textSub }}>{label}</span>
                    </div>
                  ))}
                  <span style={{ fontSize: "10px", color: C.textMuted, marginLeft: "auto" }}>
                    Generated {new Date(prediction.generatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </>
            )}


            {/* Prompt state */}
            {!prediction && !predicting && !predictError && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: C.textMuted }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🗓️</div>
                <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "6px" }}>
                  Click "Generate Forecast" above
                </div>
                <div style={{ fontSize: "13px" }}>
                  Claude AI will predict your appliance usage pattern across all 12 months
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}