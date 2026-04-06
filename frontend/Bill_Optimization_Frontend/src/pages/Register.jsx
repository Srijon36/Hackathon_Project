import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../Reducer/AuthSlice";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");
    const result = await dispatch(registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirmPassword,
    }));
    if (registerUser.fulfilled.match(result)) navigate("/login");
  };

  const errorMessage = error?.msg || error?.message || (typeof error === "string" ? error : null);

  return (
    <div className="auth-page">
      <div className="auth-card-new">

        {/* Wind turbine header image */}
        <div className="auth-card-header register-header">
          <div className="auth-logo-circle register-logo">⚡</div>
        </div>

        {/* Form body */}
        <div className="auth-card-body">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Start optimizing your energy bills today</p>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Full Name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">👤</span>
                <input
                  type="text" name="name" placeholder="John Doe"
                  value={formData.name} onChange={handleChange} required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  type="email" name="email" placeholder="name@example.com"
                  value={formData.email} onChange={handleChange} required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"} name="password"
                  placeholder="••••••••" value={formData.password} onChange={handleChange} required
                />
                <span className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            <div className="auth-field">
              <label>Confirm Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔄</span>
                <input
                  type={showConfirm ? "text" : "password"} name="confirmPassword"
                  placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required
                />
                <span className="auth-eye" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-check-label">
                <input type="checkbox" required />
                I agree to the{" "}
                <span className="auth-switch-link">Terms of Service</span>{" "}
                and <span className="auth-switch-link">Privacy Policy</span>.
              </label>
            </div>

            {passwordError && <div className="text-red error-msg">{passwordError}</div>}
            {errorMessage  && <div className="text-red error-msg">{errorMessage}</div>}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Register →"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" className="auth-switch-link">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;