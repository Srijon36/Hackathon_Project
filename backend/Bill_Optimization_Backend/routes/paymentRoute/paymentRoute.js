const express = require("express");
const { createOrder, verifyPayment, getUploadStatus } = require("../../controllers/paymentController/paymentController");
const { protect } = require("../../middlewares/authMiddleware/authMiddleware"); // adjust path if needed
const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/upload-status", protect, getUploadStatus);

module.exports = router;