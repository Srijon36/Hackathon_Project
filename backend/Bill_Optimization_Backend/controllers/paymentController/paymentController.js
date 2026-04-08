const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../../models/userModel/userModel");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Create Order ───────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const options = {
      amount: 500,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`, // ✅ fixed — under 40 chars
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ success: false, message: "Order creation failed" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// ─── Verify Payment + Add Credits ───────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: "Invalid signature sent!" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $inc: { uploadCredits: 5 },
        isSubscribed: true,
        subscribedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified. 5 uploads added.",
      uploadCredits: user.uploadCredits,
    });
  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// ─── Get Upload Status ───────────────────────────────────────────
const getUploadStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "freeUploadUsed uploadCredits"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      freeUploadUsed: user.freeUploadUsed,
      uploadCredits: user.uploadCredits,
      canUpload: !user.freeUploadUsed || user.uploadCredits > 0,
    });
  } catch (error) {
    console.error("Upload Status Error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

module.exports = { createOrder, verifyPayment, getUploadStatus };