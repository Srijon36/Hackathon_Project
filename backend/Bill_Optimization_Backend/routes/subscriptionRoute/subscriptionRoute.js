const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");
const {
  createSubscription,
  verifyPayment,
  getAllSubscriptions,
} = require("../../controllers/subscriptionController/subscriptionController");

router.post("/create", protect, createSubscription);   // ← protect added
router.post("/verify", protect, verifyPayment);        // ← protect added
router.get("/all", getAllSubscriptions);                // admin, add admin check later

module.exports = router;