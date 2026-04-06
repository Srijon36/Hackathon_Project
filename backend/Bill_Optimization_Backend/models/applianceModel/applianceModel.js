const mongoose = require("mongoose");

const applianceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // one profile per user
  },
  consumerType: {
    type: String,
    enum: ["domestic", "commercial", "industrial"],
    required: true,
  },
  appliances: [
    {
      name:        { type: String,  required: true },
      icon:        { type: String,  default: "🔌"  },
      quantity:    { type: Number,  default: 1     },
      hoursPerDay: { type: Number,  default: 4     },
      wattage:     { type: Number,  required: true },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Appliance", applianceSchema);