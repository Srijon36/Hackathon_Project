const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a 6-digit OTP email to the user.
 * @param {string} toEmail  - Recipient email address
 * @param {string} otp      - 6-digit OTP string
 */
const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"Bill Optimizer" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;
                  border: 1px solid #e0e0e0; border-radius: 8px; padding: 32px;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">Password Reset Request</h2>
        <p style="color: #555;">Use the OTP below to reset your password. It is valid for <strong>10 minutes</strong>.</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px;
                       color: #111; background: #f3f4f6; padding: 12px 24px;
                       border-radius: 8px; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="color: #999; font-size: 13px;">
          If you did not request this, please ignore this email. Your account is safe.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
