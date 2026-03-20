const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    // ✅ userId — always set from token
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    consumerNumber: {
      type: String,
      required: false,
      trim: true,
      default: "N/A",
    },

    customerId: {
      type: String,
      trim: true,
      default: "",
    },

    customerName: {
      type: String,
      required: false,
      trim: true,
      default: "N/A",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    consumerType: {
      type: String,
      enum: ["Domestic", "Commercial", "Industrial"],
      default: "Domestic",
    },

    billMonth: {
      type: String,
      required: false,
      default: "N/A",
    },

    billDate: {
      type: Date,
      required: false,
      default: null,
    },

    dueDate: {
      type: Date,
      required: false,
      default: null,
    },

    unitsBilled: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },

    energyCharges: {
      type: Number,
      default: 0,
      min: 0,
    },

    fixedDemandCharges: {
      type: Number,
      default: 0,
      min: 0,
    },

    govtDuty: {
      type: Number,
      default: 0,
      min: 0,
    },

    meterRent: {
      type: Number,
      default: 0,
      min: 0,
    },

    adjustments: {
      type: Number,
      default: 0,
    },

    grossAmount: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },

    rebate: {
      type: Number,
      default: 0,
      min: 0,
    },

    netAmount: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Overdue"],
      default: "Pending",
    },

    paymentMode: {
      type: String,
      enum: ["UPI", "Wallet", "NetBanking", "Cash", "Card", ""],
      default: "",
    },

    lastPaymentDate: {
      type: Date,
      default: null,
    },

    loadKVA: {
      type: Number,
      default: 0,
      min: 0,
    },

    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ✅ stores raw OCR text for debugging
    rawText: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Virtual field — cost per unit
billSchema.virtual("costPerUnit").get(function () {
  if (!this.unitsBilled || this.unitsBilled === 0) return 0;
  return this.energyCharges / this.unitsBilled;
});

// ✅ Auto update payment status before save
billSchema.pre("save", function () {
  if (
    this.netAmount > 0 &&
    this.dueDate &&
    new Date() > this.dueDate &&
    this.paymentStatus !== "Paid"
  ) {
    this.paymentStatus = "Overdue";
  }
});

module.exports = mongoose.model("Bill", billSchema);