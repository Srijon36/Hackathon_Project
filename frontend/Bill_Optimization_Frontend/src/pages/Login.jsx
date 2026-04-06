import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../Reducer/AuthSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

 const onSubmit = async (data) => {
  try {
    const result = await dispatch(login(data)).unwrap();
    // role-based redirect
    if (result?.user?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/upload");
    }
  } catch (err) {
    console.log("Login failed:", err);
  }
};

  return (
    <div className="auth-page">
      <div className="auth-card-new">

        {/* Green header band */}
        <div className="auth-card-header login-header">
          <div className="auth-logo-circle">⚡</div>
          <p className="auth-brand">myEnergy</p>
        </div>

        {/* Form body */}
        <div className="auth-card-body">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Login to optimize your energy bills</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="auth-field">
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  type="email"
                  placeholder="name@energy.com"
                  {...register("email", { required: "Email is required" })}
                />
              </div>
              {errors.email && <span className="text-red">{errors.email.message}</span>}
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", { required: "Password is required" })}
                />
                <span className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
              {errors.password && <span className="text-red">{errors.password.message}</span>}
            </div>

            {error && <div className="text-red error-msg">{error}</div>}

            <div className="auth-options-row">
              <label className="auth-check-label">
                <input type="checkbox" /> Remember me
              </label>

              {/* ✅ Fixed — now navigates to /forgot-password */}
              <Link to="/forgot-password" className="auth-forgot">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Signing in..." : "Login →"}
            </button>
          </form>

          <div className="auth-divider"><span>OR</span></div>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register" className="auth-switch-link">Register now</Link>
          </p>

          <p className="auth-tagline">SECURE • SUSTAINABLE • SIMPLE</p>
        </div>
      </div>
    </div>
  );
};

export default Login;