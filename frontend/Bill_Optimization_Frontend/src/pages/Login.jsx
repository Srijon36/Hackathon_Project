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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await dispatch(login(data)).unwrap();
      navigate("/dashboard");
    } catch (err) {
      console.log("Login failed:", err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-top">
          <div className="auth-icon">⚡</div>
          <h2>Welcome Back</h2>
          <p>Login to view your energy insights</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* ── Email ── */}
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <span className="text-red">{errors.email.message}</span>
            )}
          </div>

          {/* ── Password ── */}
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password", { required: "Password is required" })}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
            {errors.password && (
              <span className="text-red">{errors.password.message}</span>
            )}
          </div>

          {/* ── Server error ── */}
          {error && (
            <div className="text-red error-msg">{error}</div>
          )}

          {/* ── Remember Me + Forgot Password ── */}
          <div className="auth-options">
            <label className="remember-label">
              <input type="checkbox" /> Remember me
            </label>
            {/* ✅ fixed — no raw comment inside JSX */}
            <span
              className="forgot-password"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </span>
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;