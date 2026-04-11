const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
    default: "",
  },
  planName: {
    type: String,
    enum: ["Basic", "Pro", "Premium"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["created", "paid", "failed"],
    default: "created",
  },
  startDate: Date,
  expiryDate: Date,
},
{ timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);