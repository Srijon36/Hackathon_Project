import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOTP, verifyOTP, resetPassword } from "../Reducer/AuthSlice";
import { useNavigate, Link } from "react-router-dom";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [step,        setStep]        = useState(1);
  const [email,       setEmail]       = useState("");
  const [otp,         setOtp]         = useState("");
  const [resetToken,  setResetToken]  = useState(""); // ✅ store resetToken
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [successMsg,  setSuccessMsg]  = useState("");

  // Step 1
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const result = await dispatch(sendOTP(email));
    if (sendOTP.fulfilled.match(result)) {
      setStep(2);
      setSuccessMsg(`OTP sent to ${email}`);
    }
  };

  // Step 2 — save resetToken from response
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const result = await dispatch(verifyOTP({ email, otp }));
    if (verifyOTP.fulfilled.match(result)) {
      setResetToken(result.payload.resetToken); // ✅ save it
      setStep(3);
      setSuccessMsg("OTP verified! Set your new password.");
    }
  };

  // Step 3 — send resetToken instead of email+otp
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPass) return alert("Passwords do not match");
    const result = await dispatch(resetPassword({ resetToken, newPassword })); // ✅ fixed
    if (resetPassword.fulfilled.match(result)) {
      setSuccessMsg("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-top">
          <div className="auth-icon">🔐</div>
          <h2>Forgot Password</h2>
          <p>
            {step === 1 && "Enter your registered email"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Set your new password"}
          </p>
        </div>

        <div className="step-bar-wrap">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`step-bar ${step >= s ? "active" : ""}`} />
          ))}
        </div>

        {successMsg && <div className="success-msg">✅ {successMsg}</div>}
        {error && <div className="error-msg">❌ {error}</div>}

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
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP →"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label>Enter 6-digit OTP</label>
              <input
                type="text"
                placeholder="······"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="otp-input"
                required
              />
              <small style={{ color: "#94a3b8", fontSize: "12px", marginTop: "6px", display: "block" }}>
                OTP valid for 10 minutes
              </small>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP →"}
            </button>
            <p className="resend-row">
              Didn't receive?{" "}
              <span onClick={() => { setStep(1); setSuccessMsg(""); }}>Resend OTP</span>
            </p>
          </form>
        )}

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
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password →"}
            </button>
          </form>
        )}

        <p className="auth-footer">
          Remember your password?{" "}
          <Link to="/login" className="auth-link">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;