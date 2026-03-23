import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOTP, verifyOTP, resetPassword } from "../Reducer/AuthSlice";
import { useNavigate, Link } from "react-router-dom";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  // ✅ 3 steps
  const [step,        setStep]        = useState(1);
  const [email,       setEmail]       = useState("");
  const [otp,         setOtp]         = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [successMsg,  setSuccessMsg]  = useState("");

  // ── Step 1: Send OTP ──
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const result = await dispatch(sendOTP(email));
    if (sendOTP.fulfilled.match(result)) {
      setStep(2);
      setSuccessMsg(`OTP sent to ${email}`);
    }
  };

  // ── Step 2: Verify OTP ──
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const result = await dispatch(verifyOTP({ email, otp }));
    if (verifyOTP.fulfilled.match(result)) {
      setStep(3);
      setSuccessMsg("OTP verified! Set your new password.");
    }
  };

  // ── Step 3: Reset Password ──
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPass) {
      return alert("Passwords do not match");
    }
    const result = await dispatch(resetPassword({ email, otp, newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      setSuccessMsg("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* ── Header ── */}
        <div className="auth-top">
          <div className="auth-icon">🔐</div>
          <h2>Forgot Password</h2>
          <p>
            {step === 1 && "Enter your registered email"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Set your new password"}
          </p>
        </div>

        {/* ── Step Indicator ── */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: "4px",
                borderRadius: "2px",
                background: step >= s ? "#1e88e5" : "#e2e8f0",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        {/* ── Success Message ── */}
        {successMsg && (
          <div style={{
            background: "#dcfce7", color: "#16a34a",
            padding: "10px 14px", borderRadius: "8px",
            fontSize: "13px", marginBottom: "16px",
            fontWeight: "600",
          }}>
            ✅ {successMsg}
          </div>
        )}

        {/* ── Error Message ── */}
        {error && (
          <div className="text-red error-msg" style={{ marginBottom: "12px" }}>
            ❌ {error}
          </div>
        )}

        {/* ── Step 1: Email ── */}
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label>Registered Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label>Enter 6-digit OTP</label>
              <input
                type="text"
                placeholder="_ _ _ _ _ _"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                style={{ fontSize: "24px", letterSpacing: "8px", textAlign: "center" }}
                required
              />
              <small style={{ color: "#94a3b8", fontSize: "12px" }}>
                OTP valid for 10 minutes
              </small>
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            {/* Resend OTP */}
            <p style={{ textAlign: "center", marginTop: "12px", fontSize: "13px", color: "#64748b" }}>
              Didn't receive?{" "}
              <span
                style={{ color: "#1e88e5", cursor: "pointer", fontWeight: "600" }}
                onClick={() => { setStep(1); setSuccessMsg(""); }}
              >
                Resend OTP
              </span>
            </p>
          </form>
        )}

        {/* ── Step 3: New Password ── */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: "20px" }}>
          Remember your password?{" "}
          <Link to="/login" className="auth-link">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;