import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../Reducer/AuthSlice";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";

const HistoryIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
  </svg>
);
const HomeIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const UploadIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const DashboardIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6"  y1="6" x2="18" y2="18"/>
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const GlobeIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const Navbar = ({ onHistoryOpen }) => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const location  = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();
  const { language, changeLanguage }  = useLanguage();
  const { t } = useTranslation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  const stored = sessionStorage.getItem("energy_token");
  const token  = stored ? JSON.parse(stored)?.token : null;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const drawerItems = [
    { label: "Home",        path: "/",          icon: <HomeIcon/> },
    { label: "Dashboard",   path: "/dashboard", icon: <DashboardIcon/> },
    { label: "Upload Bill", path: "/upload",    icon: <UploadIcon/> },
    ...(onHistoryOpen ? [{
      label: "History",
      path: null,
      icon: <HistoryIcon/>,
      action: () => { onHistoryOpen(); setMenuOpen(false); }
    }] : []),
  ];

  return (
    <>
      {/* Drawer Overlay */}
      <div
        className={`nb-drawer-overlay${menuOpen ? " nb-drawer-overlay--open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Slide-in Drawer */}
      <div className={`nb-drawer${menuOpen ? " nb-drawer--open" : ""}`}>
        <div className="nb-drawer-header">
          <span
            className="nb-logo"
            onClick={() => { navigate("/"); setMenuOpen(false); }}
            style={{ cursor: "pointer" }}
          >
            <span className="nb-logo-bolt">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#f97316">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </span>
            <span className="nb-logo-energy">Energy</span>
            <span className="nb-logo-bill">Bill</span>
          </span>
          <button className="nb-drawer-close" onClick={() => setMenuOpen(false)}>
            <CloseIcon/>
          </button>
        </div>

        <nav className="nb-drawer-nav">
          {drawerItems.map((item) => (
            <button
              key={item.label}
              className={`nb-drawer-item${item.path && isActive(item.path) ? " nb-drawer-item--active" : ""}`}
              onClick={() => {
                if (item.action) item.action();
                else { navigate(item.path); setMenuOpen(false); }
              }}
            >
              <span className="nb-drawer-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Drawer footer — logout */}
        {token && (
          <div style={{ padding: "0 10px 16px" }}>
            <button className="ap-logout" onClick={() => { handleLogout(); setMenuOpen(false); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <button className="nb-hamburger" onClick={() => setMenuOpen(true)}>
            <span/><span/><span/>
          </button>

          <span className="nb-logo" style={{ cursor: "pointer", fontSize: "22px" }} onClick={() => navigate("/")}>
            <span className="nb-logo-bolt">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#f97316">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </span>
            <span className="nb-logo-energy">Energy</span>
            <span className="nb-logo-bill">Bill</span>
          </span>
        </div>

        <div className="nav-right">



          {/* Language dropdown */}
          <div className="nb-lang-wrap" ref={langRef}>
            <button className="nb-lang-btn" onClick={() => setLangOpen(v => !v)}>
              <GlobeIcon/>
              <span>{language.toUpperCase()}</span>
              <ChevronDownIcon/>
            </button>
            {langOpen && (
              <div className="nb-lang-dropdown">
                {[["en","English"],["hi","हिंदी"],["bn","বাংলা"]].map(([code, label]) => (
                  <button
                    key={code}
                    className={`nb-lang-option${language === code ? " nb-lang-option--active" : ""}`}
                    onClick={() => { changeLanguage(code); setLangOpen(false); }}
                  >
                    {language === code && <span className="nb-lang-check">✓</span>}
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark mode toggle */}
          <button
            className="nav-icon-btn"
            onClick={toggleDarkMode}
            title={darkMode ? "Light Mode" : "Dark Mode"}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1"  x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1"  y1="12" x2="3"  y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
                <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Logout / Login */}
          <button
            className="nav-icon-btn"
            onClick={token ? handleLogout : () => navigate("/login")}
            title={token ? t("logout") : t("login")}
            aria-label={token ? "Logout" : "Login"}
          >
            {token ? (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            ) : (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            )}
          </button>

        </div>
      </nav>
    </>
  );
};

export default Navbar;