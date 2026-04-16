import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const DownloadReport = ({ data }) => {

  const handleDownload = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentW = pageW - margin * 2;

    // ── Color Palette ──
    const green      = [34, 197, 94];
    const darkGreen  = [22, 163, 74];
    const darkNavy   = [15, 23, 42];
    const slate      = [71, 85, 105];
    const lightGreen = [240, 253, 244];
    const midGreen   = [220, 252, 231];
    const bgGray     = [248, 250, 252];
    const border     = [226, 232, 240];
    const white      = [255, 255, 255];
    const red        = [220, 38, 38];

    // ── Helper: rounded rect ──
    const roundedRect = (x, y, w, h, r, fill) => {
      doc.setFillColor(...fill);
      doc.roundedRect(x, y, w, h, r, r, "F");
    };

    // ── Helper: section number badge ──
    const sectionBadge = (x, y, num) => {
      roundedRect(x, y - 5, 8, 8, 4, green);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...white);
      doc.text(num, x + 4, y + 0.5, { align: "center" });
    };

    // ══════════════════════════════════════════
    // PAGE 1
    // ══════════════════════════════════════════


    // ── White background ──
    doc.setFillColor(...white);
    doc.rect(0, 0, pageW, pageH, "F");

    // ── Top navbar bar ──
    doc.setFillColor(...white);
    doc.rect(0, 0, pageW, 18, "F");
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.line(0, 18, pageW, 18);

    // Logo icon
    roundedRect(margin, 4, 10, 10, 2, lightGreen);
    doc.setFontSize(10);
    doc.setTextColor(...green);
    doc.setFont("helvetica", "bold");
    doc.text("⚡", margin + 5, 10.5, { align: "center" });

    // Logo text
    doc.setFontSize(11);
    doc.setTextColor(...darkNavy);
    doc.setFont("helvetica", "bold");
    doc.text("myEnergy", margin + 13, 11);

    // Generated date badge
    const dateStr = `Generated: ${new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`;
    const dateBadgeW = 48;
    roundedRect(pageW - margin - dateBadgeW, 4, dateBadgeW, 10, 5, lightGreen);
    doc.setFontSize(8);
    doc.setTextColor(...darkGreen);
    doc.setFont("helvetica", "bold");
    doc.text(dateStr, pageW - margin - dateBadgeW / 2, 10, { align: "center" });

    // ── Green left border accent ──
    doc.setFillColor(...green);
    doc.rect(margin, 26, 2.5, 28, "F");

    // ── Big title ──
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkNavy);
    doc.text("ENERGY BILL", margin + 8, 38);
    doc.text("OPTIMIZATION", margin + 8, 48);
    doc.text("REPORT", margin + 8, 58);

    // ── Section 01: Customer Details ──
    let y = 72;

    // Section header
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...slate);

    // Person icon circle
    roundedRect(margin, y - 5, 7, 7, 3.5, lightGreen);
    doc.setFontSize(7);
    doc.setTextColor(...green);
    doc.text("👤", margin + 3.5, y - 0.5, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkNavy);
    doc.text("CUSTOMER DETAILS", margin + 10, y);

    y += 6;
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    // Customer details grid
    const fields = [
      ["CUSTOMER NAME",   data.customerName || "N/A",       "CONSUMER NO",    data.consumerNumber || "N/A"],
      ["ADDRESS",         data.address || "N/A",            "BILL MONTH",     data.billMonth || "N/A"],
      ["PAYMENT STATUS",  data.paymentStatus || "N/A",      "ACCOUNT TYPE",   data.consumerType || "Residential"],
    ];

    const colW = contentW / 2 - 5;
    fields.forEach(([l1, v1, l2, v2]) => {
      // Label
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...slate);
      doc.text(l1, margin, y);
      doc.text(l2, margin + colW + 10, y);
      y += 5;

      // Value
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");

      if (l1 === "PAYMENT STATUS") {
        doc.setTextColor(...(v1 === "Overdue" ? red : v1 === "Paid" ? darkGreen : [217, 119, 6]));
        doc.text("● " + v1, margin, y);
      } else {
        doc.setTextColor(...darkNavy);
        doc.text(v1, margin, y);
      }

      doc.setTextColor(...darkNavy);
      doc.text(v2, margin + colW + 10, y);
      y += 10;
    });

    // ── Section 02: Bill Summary ──
    y += 4;

    // Section header with receipt icon
    roundedRect(margin, y - 5, 7, 7, 3.5, lightGreen);
    doc.setFontSize(7);
    doc.setTextColor(...green);
    doc.text("🧾", margin + 3.5, y - 0.5, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkNavy);
    doc.text("BILL SUMMARY", margin + 10, y);

    y += 8;

    const billRows = [
      ["Units Billed",            `${data.unitsBilled || 0} kWh`,                          false],
      ["Energy Charges",          `Rs. ${(data.energyCharges || 0).toLocaleString("en-IN")}`, false],
      ["Fixed Charges",           `Rs. ${(data.fixedDemandCharges || 0).toLocaleString("en-IN")}`, false],
      ["Govt Duty",               `Rs. ${(data.govtDuty || 0).toLocaleString("en-IN")}`,   false],
      ["Meter Rent",              `Rs. ${(data.meterRent || 0).toLocaleString("en-IN")}`,  false],
      ["Adjustments",             `Rs. ${(data.adjustments || 0).toLocaleString("en-IN")}`, false],
      ["Rebate",                  `-Rs. ${(data.rebate || 0).toLocaleString("en-IN")}`,    "rebate"],
      ["Gross Amount",            `Rs. ${(data.grossAmount || 0).toLocaleString("en-IN")}`, "bold"],
    ];

    // Table header
    roundedRect(margin, y, contentW, 8, 3, bgGray);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...slate);
    doc.text("DESCRIPTION", margin + 6, y + 5.5);
    doc.text("VALUE", pageW - margin - 6, y + 5.5, { align: "right" });
    y += 10;

    billRows.forEach(([label, value, style], i) => {
      if (i % 2 === 0) {
        doc.setFillColor(250, 252, 255);
        doc.rect(margin, y - 1, contentW, 9, "F");
      }

      doc.setFontSize(10);

      if (style === "bold") {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkNavy);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(55, 65, 81);
      }

      doc.text(label, margin + 6, y + 5);

      if (style === "rebate") {
        doc.setTextColor(...darkGreen);
        doc.setFont("helvetica", "bold");
      } else if (style === "bold") {
        doc.setTextColor(...darkNavy);
      } else {
        doc.setTextColor(...darkNavy);
      }

      doc.text(value, pageW - margin - 6, y + 5, { align: "right" });

      doc.setDrawColor(...border);
      doc.setLineWidth(0.2);
      doc.line(margin, y + 8, pageW - margin, y + 8);
      y += 9;
    });

    // ── Net Amount Payable — green highlight row ──
    roundedRect(margin, y + 1, contentW, 10, 3, midGreen);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkNavy);
    doc.text("Net Amount Payable", margin + 6, y + 7.5);
    doc.text(`Rs. ${(data.netAmount || 0).toLocaleString("en-IN")}`, pageW - margin - 6, y + 7.5, { align: "right" });
    y += 16;

    // ── Optimization Tip box ──
    y += 4;
    roundedRect(margin, y, contentW, 20, 4, bgGray);
    doc.setFillColor(...green);
    doc.rect(margin, y, 2, 20, "F");

    // Lightbulb icon
    roundedRect(margin + 5, y + 5, 8, 8, 4, lightGreen);
    doc.setFontSize(8);
    doc.setTextColor(...green);
    doc.text("💡", margin + 9, y + 10, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkNavy);
    doc.text("Optimization Tip", margin + 16, y + 8);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...slate);
    const tipText = `Your fixed charges account for a significant portion of your bill relative to your energy usage (${data.unitsBilled || 0} kWh). Consider reviewing your sanctioned load to reduce monthly fixed costs.`;
    const tipLines = doc.splitTextToSize(tipText, contentW - 20);
    doc.text(tipLines, margin + 16, y + 14);

    // ── Page 1 Footer ──
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...slate);

    // Left: copyright
    doc.setFontSize(7);
    doc.setTextColor(...green);
    doc.text("✓", margin, pageH - 6);
    doc.setTextColor(...slate);
    doc.text(" 2026 myEnergy Systems Inc. • Confidential Optimization Data", margin + 4, pageH - 6);

    // Right: page number
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...slate);
    doc.text("Page 1 of 2", pageW - margin, pageH - 6, { align: "right" });

    // ══════════════════════════════════════════
    // PAGE 2
    // ══════════════════════════════════════════
    doc.addPage();

    // White bg
    doc.setFillColor(...white);
    doc.rect(0, 0, pageW, pageH, "F");

    // ── Page 2 top header ──
    doc.setFillColor(...white);
    doc.rect(0, 0, pageW, 20, "F");
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.line(0, 20, pageW, 20);

    // Logo
    roundedRect(margin, 5, 10, 10, 2, lightGreen);
    doc.setFontSize(7);
    doc.setTextColor(...green);
    doc.text("⚡", margin + 5, 11, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkNavy);
    doc.text("myEnergy", margin + 13, 12);

    // Report subtitle
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...slate);
    doc.text("Energy Optimization Report", pageW / 2, 10, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...slate);
    doc.text("ANALYSIS & IMPLEMENTATION STRATEGY", pageW / 2, 15, { align: "center" });

    y = 32;

    // ── Section 03: Savings Analysis ──
    sectionBadge(margin, y, "03");
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkNavy);
    doc.text("Savings Analysis", margin + 12, y + 1);
    y += 12;

    const optimizedCost = Math.round((data.netAmount || 0) * 0.8);
    const monthlySaving = (data.netAmount || 0) - optimizedCost;
    const yearlySaving  = monthlySaving * 12;
    const saved         = (data.grossAmount || 0) - (data.netAmount || 0);
    const percent       = data.grossAmount > 0 ? Math.round((saved / data.grossAmount) * 100) : 0;

    const savingsRows = [
      ["Current Monthly Bill",       `Rs. ${(data.netAmount || 0).toLocaleString("en-IN")}`,  "neutral"],
      ["Optimized Cost",             `Rs. ${optimizedCost.toLocaleString("en-IN")}`,           "light"],
      ["Monthly Saving Potential",   `Rs. ${monthlySaving.toLocaleString("en-IN")}`,           "strong"],
      ["Yearly Saving Potential",    `Rs. ${yearlySaving.toLocaleString("en-IN")}`,            "medium"],
      ["Rebate Applied",             `${percent}%`,                                            "neutral"],
    ];

    // Table header
    roundedRect(margin, y, contentW, 8, 3, bgGray);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...slate);
    doc.text("METRIC", margin + 6, y + 5.5);
    doc.text("VALUE", pageW - margin - 6, y + 5.5, { align: "right" });
    y += 10;

    savingsRows.forEach(([label, value, style]) => {
      doc.setDrawColor(...border);
      doc.setLineWidth(0.2);
      doc.line(margin, y - 1, pageW - margin, y - 1);

      doc.setFontSize(10);
      doc.setFont(label === "Monthly Saving Potential" ? "helvetica" : "helvetica", label === "Monthly Saving Potential" ? "bold" : "normal");
      doc.setTextColor(55, 65, 81);
      doc.text(label, margin + 6, y + 5);

      // Value badge
      const badgeBg = style === "strong" ? green : style === "medium" ? midGreen : style === "light" ? lightGreen : bgGray;
      const badgeText = style === "strong" ? white : darkNavy;
      const valW = 32;
      roundedRect(pageW - margin - valW - 2, y + 0.5, valW, 8, 4, badgeBg);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...badgeText);
      doc.text(value, pageW - margin - valW / 2 - 2, y + 5.5, { align: "center" });

      y += 12;
    });

    y += 8;

    // ── Section 04: Energy Saving Recommendations ──
    sectionBadge(margin, y, "04");
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkNavy);
    doc.text("Energy Saving Recommendations", margin + 12, y + 1);
    y += 12;

    const recommendations = [
      ["1", "Switch to LED bulbs",                      "Rs. 150-200/mo", false],
      ["2", "Set AC thermostat to 24°C",                "Rs. 100-150/mo", false],
      ["3", "Unplug devices on standby",                "Rs. 50-80/mo",   false],
      ["4", "Run heavy appliances during off-peak",     "Rs. 80-100/mo",  false],
      ["5", "Install smart energy meter",               "Rs. 200+/mo",    true],
      ["6", "Consider rooftop solar",                   "Rs. 500+/mo",    true],
    ];

    // Table header
    roundedRect(margin, y, contentW, 8, 3, bgGray);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...slate);
    doc.text("#", margin + 6, y + 5.5);
    doc.text("RECOMMENDATION", margin + 18, y + 5.5);
    doc.text("EST. SAVING", pageW - margin - 6, y + 5.5, { align: "right" });
    y += 10;

    recommendations.forEach(([num, rec, saving, bold]) => {
      doc.setDrawColor(...border);
      doc.setLineWidth(0.2);
      doc.line(margin, y - 1, pageW - margin, y - 1);

      // Number
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...slate);
      doc.text(num, margin + 8, y + 5, { align: "center" });

      // Recommendation
      doc.setFont(bold ? "helvetica" : "helvetica", bold ? "bold" : "normal");
      doc.setTextColor(55, 65, 81);
      doc.text(rec, margin + 18, y + 5);

      // Saving — green text
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkGreen);
      doc.text(saving, pageW - margin - 6, y + 5, { align: "right" });

      y += 12;
    });

    // ── Page 2 Footer ──
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...green);
    doc.text("✓", margin, pageH - 6);
    doc.setTextColor(148, 163, 184);
    doc.text(" OFFICIAL ENERGY REPORT • PROJECT CARBONZERO", margin + 4, pageH - 6);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text("PAGE 2 OF 2", pageW - margin, pageH - 6, { align: "right" });

    // ── Save ──
    doc.save(`EnergyBill_Report_${(data.billMonth || "report").replace("/", "-")}.pdf`);
  };

  return (
    <button className="download-report-btn" onClick={handleDownload}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Download PDF Report
    </button>
  );
};

export default DownloadReport;