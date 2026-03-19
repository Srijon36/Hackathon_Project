import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const DownloadReport = ({ data }) => {

  const handleDownload = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // ── COVER HEADER ──
    doc.setFillColor(21, 101, 192);
    doc.rect(0, 0, pageW, 42, "F");

    doc.setFillColor(30, 136, 229);
    doc.rect(0, 32, pageW, 12, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("ENERGY BILL OPTIMIZATION", 14, 16);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Smart Analysis & Savings Report", 14, 26);

    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, pageW - 14, 26, { align: "right" });

    // ── ACCENT STRIP ──
    doc.setFillColor(255, 213, 79);
    doc.rect(0, 42, pageW, 3, "F");

    // ── CUSTOMER INFO SECTION ──
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(21, 101, 192);
    doc.text("CUSTOMER DETAILS", 14, 56);

    doc.setDrawColor(21, 101, 192);
    doc.setLineWidth(0.5);
    doc.line(14, 58, pageW - 14, 58);

    autoTable(doc, {
      startY: 62,
      body: [
        ["Customer Name", data.customerName || "N/A",  "Consumer No.", data.consumerNumber || "N/A"],
        ["Consumer Type", data.consumerType || "N/A",  "Address",      data.address || "N/A"],
        ["Bill Month",    data.billMonth || "N/A",     "Bill Date",    data.billDate ? new Date(data.billDate).toLocaleDateString("en-IN") : "N/A"],
        ["Due Date",      data.dueDate ? new Date(data.dueDate).toLocaleDateString("en-IN") : "N/A", "Payment Status", data.paymentStatus || "N/A"],
      ],
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: "bold", textColor: [71, 85, 105], cellWidth: 38 },
        1: { textColor: [15, 23, 42], cellWidth: 52 },
        2: { fontStyle: "bold", textColor: [71, 85, 105], cellWidth: 38 },
        3: { textColor: [15, 23, 42], cellWidth: 52 },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // ── BILL SUMMARY ──
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(21, 101, 192);
    doc.text("BILL SUMMARY", 14, doc.lastAutoTable.finalY + 14);
    doc.line(14, doc.lastAutoTable.finalY + 16, pageW - 14, doc.lastAutoTable.finalY + 16);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Description", "Value"]],
      body: [
        ["Units Billed",           `${data.unitsBilled || 0} kWh`],
        ["Energy Charges",         `Rs. ${(data.energyCharges || 0).toLocaleString("en-IN")}`],
        ["Fixed / Demand Charges", `Rs. ${(data.fixedDemandCharges || 0).toLocaleString("en-IN")}`],
        ["Govt Duty",              `Rs. ${(data.govtDuty || 0).toLocaleString("en-IN")}`],
        ["Meter Rent",             `Rs. ${(data.meterRent || 0).toLocaleString("en-IN")}`],
        ["Adjustments",            `Rs. ${(data.adjustments || 0).toLocaleString("en-IN")}`],
        ["Rebate (Discount)",      `- Rs. ${(data.rebate || 0).toLocaleString("en-IN")}`],
        ["Gross Amount",           `Rs. ${(data.grossAmount || 0).toLocaleString("en-IN")}`],
        ["Net Amount (Payable)",   `Rs. ${(data.netAmount || 0).toLocaleString("en-IN")}`],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [21, 101, 192],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
      },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 120, textColor: [51, 65, 85] },
        1: { cellWidth: 60, halign: "right", fontStyle: "bold", textColor: [15, 23, 42] },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      // highlight last two rows
      didParseCell: (hookData) => {
        if (hookData.row.index >= 7) {
          hookData.cell.styles.fillColor = [219, 234, 254];
          hookData.cell.styles.textColor = [21, 101, 192];
          hookData.cell.styles.fontStyle = "bold";
        }
      },
    });

    // ── SAVINGS ANALYSIS ──
    const optimizedCost  = Math.round((data.netAmount || 0) * 0.8);
    const monthlySaving  = (data.netAmount || 0) - optimizedCost;
    const yearlySaving   = monthlySaving * 12;
    const saved          = (data.grossAmount || 0) - (data.netAmount || 0);
    const percent        = data.grossAmount > 0 ? Math.round((saved / data.grossAmount) * 100) : 0;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(21, 101, 192);
    doc.text("SAVINGS ANALYSIS", 14, doc.lastAutoTable.finalY + 14);
    doc.line(14, doc.lastAutoTable.finalY + 16, pageW - 14, doc.lastAutoTable.finalY + 16);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Metric", "Value"]],
      body: [
        ["Current Monthly Bill",        `Rs. ${(data.netAmount || 0).toLocaleString("en-IN")}`],
        ["Optimized Cost (Projected)",  `Rs. ${optimizedCost.toLocaleString("en-IN")}`],
        ["Monthly Saving Potential",    `Rs. ${monthlySaving.toLocaleString("en-IN")}`],
        ["Yearly Saving Potential",     `Rs. ${yearlySaving.toLocaleString("en-IN")}`],
        ["Rebate Applied",              `${percent}%`],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [22, 163, 74],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
      },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 120, textColor: [51, 65, 85] },
        1: { cellWidth: 60, halign: "right", fontStyle: "bold", textColor: [21, 128, 61] },
      },
      alternateRowStyles: { fillColor: [240, 253, 244] },
    });

    // ── RECOMMENDATIONS ──
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(21, 101, 192);
    doc.text("ENERGY SAVING RECOMMENDATIONS", 14, doc.lastAutoTable.finalY + 14);
    doc.line(14, doc.lastAutoTable.finalY + 16, pageW - 14, doc.lastAutoTable.finalY + 16);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["#", "Recommendation", "Est. Saving"]],
      body: [
        ["1", "Switch to LED bulbs throughout your home",              "Rs. 150-200/mo"],
        ["2", "Set AC thermostat to 24°C instead of 18°C",            "Rs. 100-150/mo"],
        ["3", "Unplug devices on standby to avoid phantom load",       "Rs. 50-80/mo"],
        ["4", "Run heavy appliances during off-peak hours",            "Rs. 80-100/mo"],
        ["5", "Install a smart energy meter for real-time tracking",   "Rs. 200+/mo"],
        ["6", "Consider rooftop solar panels for long-term savings",   "Rs. 500+/mo"],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
      },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 10, halign: "center", textColor: [100, 116, 139] },
        1: { cellWidth: 120, textColor: [51, 65, 85] },
        2: { cellWidth: 50, halign: "right", fontStyle: "bold", textColor: [21, 128, 61] },
      },
      alternateRowStyles: { fillColor: [255, 251, 235] },
    });

    // ── FOOTER on every page ──
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // footer bar
      doc.setFillColor(21, 101, 192);
      doc.rect(0, doc.internal.pageSize.height - 14, pageW, 14, "F");

      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Energy Bill Optimization Report  |  Page ${i} of ${pageCount}`,
        14,
        doc.internal.pageSize.height - 5
      );
      doc.text(
        "Generated by EnergyBill App",
        pageW - 14,
        doc.internal.pageSize.height - 5,
        { align: "right" }
      );
    }

    doc.save(`EnergyBill_Report_${(data.billMonth || "report").replace("/", "-")}.pdf`);
  };

  return (
    <button className="download-report-btn" onClick={handleDownload}>
      📄 Download PDF Report
    </button>
  );
};

export default DownloadReport;