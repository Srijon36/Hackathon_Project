const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    consumerNumber: {
      type: String,
      required: [true, "Consumer number is required"],
      trim: true
    },

    customerId: {
      type: String,
      trim: true
    },

    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true
    },

    address: {
      type: String,
      trim: true
    },

    consumerType: {
      type: String,
      enum: ["Domestic", "Commercial", "Industrial"],
      default: "Domestic"
    },

    billMonth: {
      type: String,
      required: [true, "Bill month is required"]
    },

    billDate: {
      type: Date,
      required: [true, "Bill date is required"]
    },

    dueDate: {
      type: Date,
      required: [true, "Due date is required"]
    },

    unitsBilled: {
      type: Number,
      required: [true, "Units billed is required"],
      min: 0
    },

    energyCharges: {
      type: Number,
      default: 0,
      min: 0
    },

    fixedDemandCharges: {
      type: Number,
      default: 0,
      min: 0
    },

    govtDuty: {
      type: Number,
      default: 0,
      min: 0
    },

    meterRent: {
      type: Number,
      default: 0,
      min: 0
    },

    adjustments: {
      type: Number,
      default: 0
    },

    grossAmount: {
      type: Number,
      required: [true, "Gross amount is required"],
      min: 0
    },

    rebate: {
      type: Number,
      default: 0,
      min: 0
    },

    netAmount: {
      type: Number,
      required: [true, "Net amount is required"],
      min: 0
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Overdue"],
      default: "Pending"
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//// Virtual field
billSchema.virtual("costPerUnit").get(function () {
  if (!this.unitsBilled || this.unitsBilled === 0) return 0;
  return this.energyCharges / this.unitsBilled;
});

//// ✅ FIXED PRE SAVE (NO next)
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