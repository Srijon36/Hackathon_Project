const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── 1. Bill Due Reminder ─────────────────────────────────────────────────────
/**
 * @param {string} toEmail
 * @param {{ name, billMonth, netAmount, dueDate, consumerNumber }} data
 */
const sendBillDueReminder = async (toEmail, data) => {
  const { name, billMonth, netAmount, dueDate, consumerNumber } = data;
  const dueDateStr = new Date(dueDate).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const text = [
    `Hi ${name},`,
    "",
    `This is a reminder that your electricity bill for ${billMonth} is due soon.`,
    "",
    `  Consumer No. : ${consumerNumber || "N/A"}`,
    `  Bill Month   : ${billMonth}`,
    `  Amount Due   : Rs. ${Number(netAmount).toFixed(2)}`,
    `  Due Date     : ${dueDateStr}`,
    "",
    "Please pay before the due date to avoid late charges.",
    "",
    "Regards,",
    "Bill Optimizer Team",
  ].join("\n");

  await transporter.sendMail({
    from: `"Bill Optimizer" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Bill Due Reminder - ${billMonth} (Rs. ${Number(netAmount).toFixed(2)})`,
    text,
  });
};

// ─── 2. Overdue Bill Alert ────────────────────────────────────────────────────
/**
 * @param {string} toEmail
 * @param {{ name, billMonth, netAmount, dueDate, consumerNumber }} data
 */
const sendOverdueAlert = async (toEmail, data) => {
  const { name, billMonth, netAmount, dueDate, consumerNumber } = data;
  const dueDateStr = new Date(dueDate).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  const daysOverdue = Math.floor((Date.now() - new Date(dueDate)) / 86_400_000);

  const text = [
    `Hi ${name},`,
    "",
    `Your electricity bill for ${billMonth} is now ${daysOverdue} day${daysOverdue !== 1 ? "s" : ""} overdue.`,
    "Please clear the payment immediately to avoid penalties.",
    "",
    `  Consumer No. : ${consumerNumber || "N/A"}`,
    `  Bill Month   : ${billMonth}`,
    `  Amount Due   : Rs. ${Number(netAmount).toFixed(2)}`,
    `  Due Date     : ${dueDateStr}`,
    `  Days Overdue : ${daysOverdue} day${daysOverdue !== 1 ? "s" : ""}`,
    "",
    "Regards,",
    "Bill Optimizer Team",
  ].join("\n");

  await transporter.sendMail({
    from: `"Bill Optimizer" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `OVERDUE ALERT - ${billMonth} bill unpaid (${daysOverdue}d overdue)`,
    text,
  });
};

// ─── 3. Subscription Expiry Warning ──────────────────────────────────────────
/**
 * @param {string} toEmail
 * @param {{ name, planName, expiryDate, daysLeft }} data
 */
const sendSubscriptionExpiryWarning = async (toEmail, data) => {
  const { name, planName, expiryDate, daysLeft } = data;
  const expiryStr = new Date(expiryDate).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const text = [
    `Hi ${name},`,
    "",
    `Your ${planName} subscription will expire in ${daysLeft} day${daysLeft !== 1 ? "s" : ""} on ${expiryStr}.`,
    "Please renew to keep enjoying uninterrupted access.",
    "",
    `  Current Plan    : ${planName}`,
    `  Expiry Date     : ${expiryStr}`,
    `  Days Remaining  : ${daysLeft}`,
    "",
    "After expiry your account will revert to the Free plan.",
    "",
    "Regards,",
    "Bill Optimizer Team",
  ].join("\n");

  await transporter.sendMail({
    from: `"Bill Optimizer" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Subscription Expiring in ${daysLeft} Day${daysLeft !== 1 ? "s" : ""} - ${planName} Plan`,
    text,
  });
};

// ─── 4. Bill Upload Confirmation ─────────────────────────────────────────────
/**
 * @param {string} toEmail
 * @param {{ name, billMonth, netAmount, consumerNumber, uploadedAt }} data
 */
const sendBillUploadConfirmation = async (toEmail, data) => {
  const { name, billMonth, netAmount, consumerNumber, uploadedAt } = data;
  const uploadedAtStr = new Date(uploadedAt || Date.now()).toLocaleString("en-IN");

  const text = [
    `Hi ${name},`,
    "",
    "Your electricity bill has been uploaded and processed successfully.",
    "",
    `  Consumer No. : ${consumerNumber || "N/A"}`,
    `  Bill Month   : ${billMonth}`,
    `  Net Amount   : Rs. ${Number(netAmount).toFixed(2)}`,
    `  Uploaded At  : ${uploadedAtStr}`,
    "",
    "You can now view your bill analysis, energy tips, and cost breakdown in the dashboard.",
    "",
    "Regards,",
    "Bill Optimizer Team",
  ].join("\n");

  await transporter.sendMail({
    from: `"Bill Optimizer" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Bill Uploaded Successfully - ${billMonth}`,
    text,
  });
};

// ─── 5. Welcome Email ─────────────────────────────────────────────────────────
/**
 * @param {string} toEmail
 * @param {{ name }} data
 */
const sendWelcomeEmail = async (toEmail, data) => {
  const { name } = data;

  const text = [
    `Hi ${name},`,
    "",
    "Welcome to Bill Optimizer! We are glad to have you on board.",
    "",
    "Here is what you can do with Bill Optimizer:",
    "  - Upload your electricity bills (PDF or image)",
    "  - Get AI-powered analysis and savings tips",
    "  - Track your usage trends over time",
    "  - Receive automatic due-date reminders",
    "  - Discover appliance-level energy optimizations",
    "",
    "If you need any help, feel free to reach out to our support team.",
    "",
    "Regards,",
    "Bill Optimizer Team",
  ].join("\n");

  await transporter.sendMail({
    from: `"Bill Optimizer" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Welcome to Bill Optimizer, ${name}!`,
    text,
  });
};

module.exports = {
  sendBillDueReminder,
  sendOverdueAlert,
  sendSubscriptionExpiryWarning,
  sendBillUploadConfirmation,
  sendWelcomeEmail,
};
