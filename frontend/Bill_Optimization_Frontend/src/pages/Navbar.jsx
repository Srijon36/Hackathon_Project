import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../Reducer/AuthSlice";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { darkMode, toggleDarkMode }   = useTheme();
  const { language, changeLanguage }   = useLanguage();
  const { t } = useTranslation();

  const stored = sessionStorage.getItem("energy_token");
  const token  = stored ? JSON.parse(stored)?.token : null;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        ⚡ <span>Energy</span>Bill
      </Link>

      <div className="nav-links">
        <Link to="/">{t("home")}</Link>
        <Link to="/upload">{t("uploadBill")}</Link>
        <Link to="/dashboard">{t("dashboard")}</Link>

        {/* ✅ Language Switcher */}
        <div className="lang-switcher">
          <button
            className={`lang-btn ${language === "en" ? "active" : ""}`}
            onClick={() => changeLanguage("en")}
          >
            EN
          </button>
          <button
            className={`lang-btn ${language === "hi" ? "active" : ""}`}
            onClick={() => changeLanguage("hi")}
          >
            हि
          </button>
          <button
            className={`lang-btn ${language === "bn" ? "active" : ""}`}
            onClick={() => changeLanguage("bn")}
          >
            বাং
          </button>
        </div>

        {/* ✅ Dark mode toggle */}
        <button
          className="dark-toggle"
          onClick={toggleDarkMode}
          title={darkMode ? "Light Mode" : "Dark Mode"}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {token ? (
          <button className="nav-btn" onClick={handleLogout}>
            {t("logout")}
          </button>
        ) : (
          <button className="nav-btn" onClick={() => navigate("/login")}>
            {t("login")}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;