const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    phone: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    // =========================
    // ✅ SUBSCRIPTION SYSTEM
    // =========================

    isSubscribed: {
      type: Boolean,
      default: false,
    },

    plan: {
      type: String,
      enum: ["Free", "Basic", "Pro", "Premium"],
      default: "Free",
    },

    subscribedAt: {
      type: Date,
      default: null,
    },

    subscriptionExpiry: {
      type: Date,
      default: null,
    },

    lastOrderId: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // =========================
    // ✅ CREDIT SYSTEM
    // =========================

    freeUploadUsed: {
      type: Boolean,
      default: false,
    },

    uploadCredits: {
      type: Number,
      default: 0,
    },

    // =========================
    // ✅ OTP SYSTEM
    // =========================

    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);