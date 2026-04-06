const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  isSubscribed: { type: Boolean, default: false },          // ← NEW
  subscribedAt: { type: Date, default: null },              // ← NEW
  isActive: { type: Boolean, default: true },               // ← NEW
  createdAt: { type: Date, default: Date.now },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
});

module.exports = mongoose.model("User", userSchema);