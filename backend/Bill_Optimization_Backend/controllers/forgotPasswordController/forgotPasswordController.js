const User   = require("../../models/userModel/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// ✅ create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ✅ generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ── STEP 1: Send OTP ──────────────────────────────────────
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // generate OTP + set expiry (10 minutes)
    const otp       = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // save OTP to user
    user.otp       = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // send OTP email
    const transporter = createTransporter();
    await transporter.sendMail({
      from:    `"Energy Bill App" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: "🔐 Your Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: #1e88e5; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #fff; margin: 0;">⚡ Energy Bill App</h1>
          </div>
          <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px;">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your password reset OTP is:</p>

            <div style="
              background: #fff;
              border: 2px dashed #1e88e5;
              border-radius: 12px;
              padding: 24px;
              text-align: center;
              margin: 20px 0;
            ">
              <h1 style="
                font-size: 48px;
                font-weight: 800;
                color: #1e88e5;
                letter-spacing: 12px;
                margin: 0;
              ">${otp}</h1>
              <p style="color: #94a3b8; margin-top: 8px; font-size: 13px;">
                Valid for 10 minutes only
              </p>
            </div>

            <p style="color: #64748b; font-size: 13px;">
              If you didn't request this, ignore this email.
              Your password will not be changed.
            </p>
          </div>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: `OTP sent to ${email}`,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ── STEP 2: Verify OTP ────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // check OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // check OTP not expired
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ── STEP 3: Reset Password ────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // verify OTP again
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    // ✅ hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ update password + clear OTP
    user.password  = hashedPassword;
    user.otp       = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully! Please login.",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
  exports.sendOTP = async (req, res) => {
  try {
    console.log("📧 send-otp called with:", req.body); // ✅ add this
    const { email } = req.body;
    // ... rest of code
  } catch (err) {
    console.error("❌ sendOTP error:", err.message); // ✅ add this
    res.status(500).json({ success: false, message: err.message });
  }
};
};