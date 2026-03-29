const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// ✅ CORS must come before routes
app.use(cors({
  origin: "http://localhost:5173", // your frontend URL
  credentials: true,
}));

// ✅ express.json() and express.urlencoded() only parse
// application/json and application/x-www-form-urlencoded
// They do NOT interfere with multipart/form-data (multer handles that)
// So this order is safe — but DO NOT add any body-parser for multipart
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ MongoDB Connection Failed:", err));

// 🔹 Import Routes
const billRoutes             = require("./routes/billRoute/billRoute");
const registerRoutes         = require("./routes/registerRoute/registerRoute");
const loginRoutes            = require("./routes/loginRoute/loginRoute");
const analysisRoutes         = require("./routes/analysisRoute/analysisRoute");
const uploadsRoutes          = require("./routes/uploadRoute/uploadRoute");
const forgotPasswordRoutes   = require("./routes/forgotPasswordRoutes/forgotPasswordRoutes");

// 🔹 Use Routes
app.use("/api/bills",              billRoutes);
app.use("/api/logins",             loginRoutes);
app.use("/api/registers",          registerRoutes);
app.use("/api/analysis",           analysisRoutes);
app.use("/api/uploads",            uploadsRoutes);
app.use("/api/forgot-password",    forgotPasswordRoutes);

// 🔹 Health Check Route
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