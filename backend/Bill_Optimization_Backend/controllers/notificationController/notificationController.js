const Bill = require("../../models/billModel/billModel");
const User = require("../../models/userModel/userModel");
const {
  sendBillDueReminder,
  sendOverdueAlert,
  sendSubscriptionExpiryWarning,
  sendBillUploadConfirmation,
  sendWelcomeEmail,
} = require("../../utils/notificationMailer");

// ─── Helper ───────────────────────────────────────────────────────────────────
const daysDiff = (date) =>
  Math.round((new Date(date) - Date.now()) / 86_400_000);

// ─── POST /api/notifications/send-due-reminders ───────────────────────────────
/**
 * Admin: manually trigger due-date reminder emails for all applicable bills.
 */
exports.sendDueReminders = async (req, res, next) => {
  try {
    const bills = await Bill.find({
      paymentStatus: "Pending",
      dueDate: { $gt: new Date() },
    }).populate("userId", "name email isActive");

    const results = { sent: [], skipped: [], failed: [] };

    for (const bill of bills) {
      const user = bill.userId;
      if (!user || !user.isActive || !user.email) {
        results.skipped.push(bill._id);
        continue;
      }
      try {
        await sendBillDueReminder(user.email, {
          name: user.name,
          billMonth: bill.billMonth,
          netAmount: bill.netAmount,
          dueDate: bill.dueDate,
          consumerNumber: bill.consumerNumber,
        });
        results.sent.push({ billId: bill._id, email: user.email, billMonth: bill.billMonth });
      } catch (err) {
        results.failed.push({ billId: bill._id, email: user.email, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: "Due reminder job completed",
      summary: {
        sent: results.sent.length,
        skipped: results.skipped.length,
        failed: results.failed.length,
      },
      details: results,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/notifications/send-overdue-alerts ─────────────────────────────
/**
 * Admin: manually trigger overdue alert emails for all overdue bills.
 */
exports.sendOverdueAlerts = async (req, res, next) => {
  try {
    const bills = await Bill.find({
      paymentStatus: { $in: ["Pending", "Overdue"] },
      dueDate: { $lt: new Date() },
    }).populate("userId", "name email isActive");

    const results = { sent: [], skipped: [], failed: [] };

    for (const bill of bills) {
      const user = bill.userId;
      if (!user || !user.isActive || !user.email) {
        results.skipped.push(bill._id);
        continue;
      }
      try {
        await sendOverdueAlert(user.email, {
          name: user.name,
          billMonth: bill.billMonth,
          netAmount: bill.netAmount,
          dueDate: bill.dueDate,
          consumerNumber: bill.consumerNumber,
        });
        results.sent.push({ billId: bill._id, email: user.email, billMonth: bill.billMonth });
      } catch (err) {
        results.failed.push({ billId: bill._id, email: user.email, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: "Overdue alert job completed",
      summary: {
        sent: results.sent.length,
        skipped: results.skipped.length,
        failed: results.failed.length,
      },
      details: results,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/notifications/send-subscription-warnings ──────────────────────
/**
 * Admin: manually trigger subscription expiry warning emails.
 */
exports.sendSubscriptionWarnings = async (req, res, next) => {
  try {
    const users = await User.find({
      isSubscribed: true,
      subscriptionExpiry: { $ne: null },
      isActive: true,
    });

    const results = { sent: [], skipped: [], failed: [] };

    for (const user of users) {
      const daysLeft = daysDiff(user.subscriptionExpiry);
      if (daysLeft < 0) { results.skipped.push(user.email); continue; } // already expired
      try {
        await sendSubscriptionExpiryWarning(user.email, {
          name: user.name,
          planName: user.plan,
          expiryDate: user.subscriptionExpiry,
          daysLeft,
        });
        results.sent.push({ email: user.email, plan: user.plan, daysLeft });
      } catch (err) {
        results.failed.push({ email: user.email, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: "Subscription warning job completed",
      summary: {
        sent: results.sent.length,
        skipped: results.skipped.length,
        failed: results.failed.length,
      },
      details: results,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/notifications/send-bill-confirmation ──────────────────────────
/**
 * Called after a bill is successfully uploaded.
 * Body: { billId }   OR pass billId directly from upload route.
 */
exports.sendBillConfirmation = async (req, res, next) => {
  try {
    const { billId } = req.body;
    if (!billId) return res.status(400).json({ success: false, message: "billId is required" });

    const bill = await Bill.findById(billId).populate("userId", "name email isActive");
    if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });

    const user = bill.userId;
    if (!user || !user.email)
      return res.status(404).json({ success: false, message: "User not found for this bill" });

    await sendBillUploadConfirmation(user.email, {
      name: user.name,
      billMonth: bill.billMonth,
      netAmount: bill.netAmount,
      consumerNumber: bill.consumerNumber,
      uploadedAt: bill.createdAt,
    });

    res.status(200).json({ success: true, message: `Bill confirmation sent to ${user.email}` });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/notifications/send-welcome ────────────────────────────────────
/**
 * Send a welcome email to a newly registered user.
 * Body: { userId }
 */
exports.sendWelcome = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "userId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await sendWelcomeEmail(user.email, { name: user.name });

    res.status(200).json({ success: true, message: `Welcome email sent to ${user.email}` });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/notifications/send-custom ─────────────────────────────────────
/**
 * Admin: send any of the notification types to a specific user by email.
 * Body: { type, email, data }
 *   type: "due" | "overdue" | "subscription" | "welcome"
 */
exports.sendCustom = async (req, res, next) => {
  try {
    const { type, email, data } = req.body;
    if (!type || !email) {
      return res.status(400).json({ success: false, message: "type and email are required" });
    }

    const handlers = {
      due: () => sendBillDueReminder(email, data || {}),
      overdue: () => sendOverdueAlert(email, data || {}),
      subscription: () => sendSubscriptionExpiryWarning(email, data || {}),
      welcome: () => sendWelcomeEmail(email, data || {}),
      "bill-confirmation": () => sendBillUploadConfirmation(email, data || {}),
    };

    const handler = handlers[type];
    if (!handler) {
      return res.status(400).json({
        success: false,
        message: `Unknown type. Valid types: ${Object.keys(handlers).join(", ")}`,
      });
    }

    await handler();
    res.status(200).json({ success: true, message: `"${type}" notification sent to ${email}` });
  } catch (err) {
    next(err);
  }
};
