const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../../middlewares/authMiddleware/authMiddleware");
const {
  sendDueReminders,
  sendOverdueAlerts,
  sendSubscriptionWarnings,
  sendBillConfirmation,
  sendWelcome,
  sendCustom,
} = require("../../controllers/notificationController/notificationController");

// All notification routes require a valid JWT token.
// Bulk blast endpoints are additionally restricted to admin only.

// ─── Admin-only: bulk triggers ────────────────────────────────────────────────
// POST /api/notifications/send-due-reminders
router.post("/send-due-reminders",     protect, adminOnly, sendDueReminders);

// POST /api/notifications/send-overdue-alerts
router.post("/send-overdue-alerts",    protect, adminOnly, sendOverdueAlerts);

// POST /api/notifications/send-subscription-warnings
router.post("/send-subscription-warnings", protect, adminOnly, sendSubscriptionWarnings);

// ─── Auth user: targeted sends ────────────────────────────────────────────────
// POST /api/notifications/send-bill-confirmation  { billId }
router.post("/send-bill-confirmation", protect, sendBillConfirmation);

// POST /api/notifications/send-welcome            { userId }
router.post("/send-welcome",           protect, adminOnly, sendWelcome);

// ─── Admin-only: flexible custom sender ─────────────────────────────────────
// POST /api/notifications/send-custom             { type, email, data }
router.post("/send-custom",            protect, adminOnly, sendCustom);

module.exports = router;
