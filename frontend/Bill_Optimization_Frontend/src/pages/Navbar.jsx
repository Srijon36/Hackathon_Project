import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../Reducer/AuthSlice";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { darkMode, toggleDarkMode } = useTheme();

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
        <Link to="/">Home</Link>
        <Link to="/upload">Upload Bill</Link>
        <Link to="/dashboard">Dashboard</Link>

        {/* ✅ Dark mode toggle */}
        <button
          className="dark-toggle"
          onClick={toggleDarkMode}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {token ? (
          <button className="nav-btn" onClick={handleLogout}>Logout</button>
        ) : (
          <button className="nav-btn" onClick={() => navigate("/login")}>Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;