import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../Reducer/AuthSlice";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  const stored = sessionStorage.getItem("energy_token");
  const token  = stored ? JSON.parse(stored)?.token : null;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* Left: Logo + Nav links */}
      <div className="nav-left">
        <Link to="/" className="nav-logo">EnergyBill</Link>

        <div className="nav-links">
          <Link to="/"         className={`nav-link ${isActive("/")          ? "nav-link--active" : ""}`}>{t("home")}</Link>
          <Link to="/upload"   className={`nav-link ${isActive("/upload")    ? "nav-link--active" : ""}`}>{t("uploadBill")}</Link>
          <Link to="/dashboard"className={`nav-link ${isActive("/dashboard") ? "nav-link--active" : ""}`}>{t("dashboard")}</Link>
        </div>
      </div>

      {/* Right: Lang switcher + icons */}
      <div className="nav-right">

        {/* Language pills */}
        <div className="nav-lang">
          {[["en","EN"],["hi","HI"],["bn","BN"]].map(([code, label]) => (
            <button
              key={code}
              className={`nav-lang-btn ${language === code ? "nav-lang-btn--active" : ""}`}
              onClick={() => changeLanguage(code)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Dark mode toggle */}
        <button
          className="nav-icon-btn"
          onClick={toggleDarkMode}
          title={darkMode ? "Light Mode" : "Dark Mode"}
          aria-label="Toggle dark mode"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {darkMode
              ? <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>
              : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            }
          </svg>
        </button>

        {/* Logout / Login */}
        <button
          className="nav-icon-btn"
          onClick={token ? handleLogout : () => navigate("/login")}
          title={token ? t("logout") : t("login")}
          aria-label={token ? "Logout" : "Login"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {token
              ? <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>
              : <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></>
            }
          </svg>
        </button>

      </div>
    </nav>
  );
};

export default Navbar;