const bcrypt        = require("bcryptjs");
const User          = require("../../models/userModel/userModel");
const { sendOtpEmail } = require("../../utils/mailer");

// ─────────────────────────────────────────────────────────────
// Helper: generate a random 6-digit OTP
// ─────────────────────────────────────────────────────────────
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─────────────────────────────────────────────────────────────
// STEP 1 — POST /api/forgot-password/send-otp
// Body: { email }
// ─────────────────────────────────────────────────────────────
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Generic message to prevent user enumeration
      return res.status(200).json({
        success: true,
        message: "If that email exists, an OTP has been sent.",
      });
    }

    const otp       = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp       = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOtpEmail(user.email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email address. It is valid for 10 minutes.",
    });
  } catch (error) {
    console.error("❌ sendOtp error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// STEP 2 — POST /api/forgot-password/verify-otp
// Body: { email, otp }
// Returns a short-lived reset token (the hashed OTP itself) that
// the frontend must pass to the reset-password endpoint.
// ─────────────────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.otp || !user.otpExpiry) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    if (new Date() > user.otpExpiry) {
      // Clear expired OTP
      user.otp       = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    if (user.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: "Incorrect OTP." });
    }

    // OTP is valid — generate a one-time reset token (valid 15 min)
    const jwt = require("jsonwebtoken");
    const resetToken = jwt.sign(
      { userId: user._id, purpose: "password-reset" },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );

    // Clear the OTP so it cannot be reused
    user.otp       = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified. Use the reset token to set your new password.",
      resetToken,
      // Frontend redirect hint:  /reset-password?token=<resetToken>
    });
  } catch (error) {
    console.error("❌ verifyOtp error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// STEP 3 — POST /api/forgot-password/reset-password
// Body: { resetToken, newPassword }
// ─────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: "Reset token and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const jwt = require("jsonwebtoken");
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.SECRET_KEY);
    } catch {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
    }

    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({ success: false, message: "Invalid token purpose." });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("❌ resetPassword error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = { sendOtp, verifyOtp, resetPassword };
