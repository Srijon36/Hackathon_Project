const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://1313kfc0-5173.inc1.devtunnels.ms"
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Import createDefaultAdmin
const { createDefaultAdmin } = require("./controllers/registerController/registerController");

// 🔹 MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected Successfully");
    await createDefaultAdmin();
  })
  .catch((err) => console.log("❌ MongoDB Connection Failed:", err));

// 🔹 Import Routes
const billRoutes           = require("./routes/billRoute/billRoute");
const registerRoutes       = require("./routes/registerRoute/registerRoute");
const loginRoutes          = require("./routes/loginRoute/loginRoute");
const analysisRoutes       = require("./routes/analysisRoute/analysisRoute");
const uploadsRoutes        = require("./routes/uploadRoute/uploadRoute");
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes/forgotPasswordRoutes");
const applianceRoutes      = require("./routes/applianceRoute/applianceRoute");
const predictionRoute      = require("./routes/predictRoute/predictRoute");
const adminRoute           = require("./routes/adminRoute/adminRoute");
const paymentRoute         = require("./routes/paymentRoute/paymentRoute");
const subscriptionRoute    = require("./routes/subscriptionRoute/subscriptionRoute"); // ← ADD THIS

// 🔹 Use Routes
app.use("/api/bills",           billRoutes);
app.use("/api/logins",          loginRoutes);
app.use("/api/registers",       registerRoutes);
app.use("/api/analysis",        analysisRoutes);
app.use("/api/uploads",         uploadsRoutes);
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/appliances",      applianceRoutes);
app.use("/api/predict",         predictionRoute);
app.use("/api/admin",           adminRoute);
app.use("/api/payment",         paymentRoute);
app.use("/api/subscription",    subscriptionRoute);  // ← ADD THIS

// 🔹 Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running successfully 🚀",
  });
});

// 🔹 Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 🔹 Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});