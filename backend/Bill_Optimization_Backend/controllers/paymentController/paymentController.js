const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../../models/userModel/userModel");
const Subscription = require("../../models/subscriptionModel/subscriptionModel"); // ← ADD

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Create Order ────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { planName = "Pro", amount = 500 } = req.body; // ← accept from frontend

    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { planName, userId: req.user.id },
    };

    const order = await razorpay.orders.create(options);
    if (!order) {
      return res.status(500).json({ success: false, message: "Order creation failed" });
    }

    // ← Save pending subscription record
    await Subscription.create({
      userId: req.user.id,
      orderId: order.id,
      planName,
      amount,
      status: "created",
    });

    res.status(200).json({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// ─── Verify Payment + Add Credits ────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Signature verification
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: "Invalid signature sent!" });
    }

    // ← Update Subscription record to "paid"
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    const subscription = await Subscription.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        status: "paid",
        startDate: new Date(),
        expiryDate: expiry,
      },
      { new: true }
    );

    // Update user credits
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
      subscription,
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