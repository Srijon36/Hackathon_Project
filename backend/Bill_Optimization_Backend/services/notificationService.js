const cron = require("node-cron");
const Bill = require("../models/billModel/billModel");
const User = require("../models/userModel/userModel");
const {
  sendBillDueReminder,
  sendOverdueAlert,
  sendSubscriptionExpiryWarning,
} = require("../utils/notificationMailer");

// ─── Helper ───────────────────────────────────────────────────────────────────
const daysDiff = (date) =>
  Math.round((new Date(date) - Date.now()) / 86_400_000);

// ─── 1. Bill Due Reminders ─────────────────────────────────────────────────────
/**
 * Runs daily at 08:00 AM.
 * Sends a reminder if the bill due date is exactly 7, 3, or 1 day(s) away.
 */
const scheduleBillDueReminders = () => {
  cron.schedule("0 8 * * *", async () => {
    console.log("🔔 [Notification] Running bill due-date reminder job...");
    try {
      const bills = await Bill.find({
        paymentStatus: "Pending",
        dueDate: { $ne: null },
      }).populate("userId", "name email isActive");

      for (const bill of bills) {
        const user = bill.userId;
        if (!user || !user.isActive || !user.email) continue;

        const daysLeft = daysDiff(bill.dueDate);

        if ([7, 3, 1].includes(daysLeft)) {
          try {
            await sendBillDueReminder(user.email, {
              name: user.name,
              billMonth: bill.billMonth,
              netAmount: bill.netAmount,
              dueDate: bill.dueDate,
              consumerNumber: bill.consumerNumber,
            });
            console.log(
              `  ✅ Due reminder sent to ${user.email} — ${bill.billMonth} (${daysLeft}d left)`
            );
          } catch (mailErr) {
            console.error(`  ❌ Failed to send to ${user.email}:`, mailErr.message);
          }
        }
      }
    } catch (err) {
      console.error("❌ [Notification] Bill due reminder job failed:", err.message);
    }
  });
  console.log("✅ [Notification] Bill due-date reminder scheduler started (daily 08:00)");
};

// ─── 2. Overdue Bill Alerts ────────────────────────────────────────────────────
/**
 * Runs daily at 09:00 AM.
 * Alerts users whose bills are 1 or 7 days past the due date.
 */
const scheduleOverdueAlerts = () => {
  cron.schedule("0 9 * * *", async () => {
    console.log("🔔 [Notification] Running overdue bill alert job...");
    try {
      const bills = await Bill.find({
        paymentStatus: { $in: ["Pending", "Overdue"] },
        dueDate: { $lt: new Date() },
      }).populate("userId", "name email isActive");

      for (const bill of bills) {
        const user = bill.userId;
        if (!user || !user.isActive || !user.email) continue;

        const daysOverdue = Math.abs(daysDiff(bill.dueDate));

        if ([1, 7].includes(daysOverdue)) {
          try {
            await sendOverdueAlert(user.email, {
              name: user.name,
              billMonth: bill.billMonth,
              netAmount: bill.netAmount,
              dueDate: bill.dueDate,
              consumerNumber: bill.consumerNumber,
            });
            console.log(
              `  ✅ Overdue alert sent to ${user.email} — ${bill.billMonth} (${daysOverdue}d overdue)`
            );
          } catch (mailErr) {
            console.error(`  ❌ Failed to send to ${user.email}:`, mailErr.message);
          }
        }
      }
    } catch (err) {
      console.error("❌ [Notification] Overdue alert job failed:", err.message);
    }
  });
  console.log("✅ [Notification] Overdue alert scheduler started (daily 09:00)");
};

// ─── 3. Subscription Expiry Warnings ──────────────────────────────────────────
/**
 * Runs daily at 10:00 AM.
 * Warns users whose subscription expires in exactly 7 or 1 day(s).
 */
const scheduleSubscriptionExpiryWarnings = () => {
  cron.schedule("0 10 * * *", async () => {
    console.log("🔔 [Notification] Running subscription expiry warning job...");
    try {
      const users = await User.find({
        isSubscribed: true,
        subscriptionExpiry: { $ne: null },
        isActive: true,
      });

      for (const user of users) {
        const daysLeft = daysDiff(user.subscriptionExpiry);

        if ([7, 1].includes(daysLeft)) {
          try {
            await sendSubscriptionExpiryWarning(user.email, {
              name: user.name,
              planName: user.plan,
              expiryDate: user.subscriptionExpiry,
              daysLeft,
            });
            console.log(
              `  ✅ Subscription warning sent to ${user.email} — ${user.plan} (${daysLeft}d left)`
            );
          } catch (mailErr) {
            console.error(`  ❌ Failed to send to ${user.email}:`, mailErr.message);
          }
        }
      }
    } catch (err) {
      console.error("❌ [Notification] Subscription expiry job failed:", err.message);
    }
  });
  console.log("✅ [Notification] Subscription expiry scheduler started (daily 10:00)");
};

// ─── Start All Schedulers ──────────────────────────────────────────────────────
const startAllNotificationJobs = () => {
  scheduleBillDueReminders();
  scheduleOverdueAlerts();
  scheduleSubscriptionExpiryWarnings();
};

module.exports = {
  startAllNotificationJobs,
  // Expose individual schedulers so they can be tested/started independently
  scheduleBillDueReminders,
  scheduleOverdueAlerts,
  scheduleSubscriptionExpiryWarnings,
};
