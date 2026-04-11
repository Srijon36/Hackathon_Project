const Subscription = require("../../models/subscriptionModel/subscriptionModel");

// CREATE ORDER
exports.createSubscription = async (req, res) => {
  try {
    const { planName, amount } = req.body;

    // Example order id (replace with Razorpay order)
    const orderId = "order_" + Date.now();

    const subscription = await Subscription.create({
      userId: req.user.id,
      orderId,
      planName,
      amount,
    });

    res.json(subscription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PAYMENT SUCCESS
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    await Subscription.findOneAndUpdate(
      { orderId },
      {
        paymentId,
        status: "paid",
        startDate: new Date(),
        expiryDate: expiry,
      }
    );

    res.json({ message: "Subscription Activated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL SUBSCRIBERS (Admin)
exports.getAllSubscriptions = async (req, res) => {
  const subs = await Subscription
    .find()
    .populate("userId", "name email");

  res.json(subs);
};