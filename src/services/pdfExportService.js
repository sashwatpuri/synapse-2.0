import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatNumber } from "./carbonService";

export function exportCertificationPdf({ selectedRecord, records, summary, role, pricePerCredit }) {
  if (!selectedRecord) return;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const generatedOn = new Date();

  doc.setFillColor(16, 40, 29);
  doc.rect(0, 0, 595, 95, "F");

  doc.setTextColor(239, 248, 238);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("Soil Carbon Certification Report", 40, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Carbon Monitoring and Certification Dashboard", 40, 62);
  doc.text(`Generated: ${generatedOn.toLocaleString()}`, 40, 78);

  doc.setTextColor(30, 45, 34);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Plot Certification Snapshot", 40, 120);

  const statusText = selectedRecord.isEligible ? "ELIGIBLE" : "NOT ELIGIBLE";
  const statusColor = selectedRecord.isEligible ? [46, 140, 87] : [188, 78, 69];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(402, 104, 155, 28, 8, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`Status: ${statusText}`, 418, 122);

  autoTable(doc, {
    startY: 140,
    theme: "grid",
    head: [["Field", "Value"]],
    body: [
      ["Farmer", selectedRecord.farmer],
      ["Plot", `Plot ${selectedRecord.plotId}`],
      ["Reporting Period", `${selectedRecord.periodStart || "-"} to ${selectedRecord.periodEnd || "-"}`],
      ["Role Exported By", role === "admin" ? "Admin / Certifying Authority" : "Data Analyst"],
      ["Price Per Credit", `₹${formatNumber(pricePerCredit, 2)}`],
      ["Confidence", `${formatNumber(selectedRecord.confidence * 100, 2)}%`]
    ],
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [20, 42, 32], textColor: [240, 248, 240] },
    alternateRowStyles: { fillColor: [245, 249, 245] }
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 16,
    theme: "grid",
    head: [["Metric", "Value"]],
    body: [
      ["SOC (%)", formatNumber(selectedRecord.soc, 2)],
      ["SOC Stock", formatNumber(selectedRecord.socStock, 2)],
      ["CO2 Equivalent (kg)", formatNumber(selectedRecord.co2Eq, 2)],
      ["Baseline CO2 (kg)", formatNumber(selectedRecord.baseCO2, 2)],
      ["Additional CO2 (kg)", formatNumber(selectedRecord.additionalCO2, 2)],
      ["Carbon Credits", formatNumber(selectedRecord.credits, 4)],
      ["Buffer Credits (10%)", formatNumber(selectedRecord.buffer, 4)],
      ["Final Credits", formatNumber(selectedRecord.finalCredits, 4)],
      ["Estimated Revenue", `₹${formatNumber(selectedRecord.revenue, 2)}`]
    ],
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [20, 42, 32], textColor: [240, 248, 240] },
    alternateRowStyles: { fillColor: [245, 249, 245] }
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    theme: "grid",
    head: [["Portfolio Summary", "Value"]],
    body: [
      ["Total Credits", formatNumber(summary.totalCredits, 3)],
      ["Final Credits", formatNumber(summary.finalCredits, 3)],
      ["Total Revenue", `₹${formatNumber(summary.totalRevenue, 2)}`],
      ["Eligible Plots", `${summary.eligibleCount} / ${summary.totalCount}`],
      ["Total Farmers", `${summary.farmerCount}`]
    ],
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [90, 107, 73], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 250, 246] }
  });

  const sampleRows = records.slice(0, 10).map((row) => [
    row.id,
    row.farmer,
    `Plot ${row.plotId}`,
    formatNumber(row.finalCredits, 3),
    `₹${formatNumber(row.revenue, 2)}`,
    row.isEligible ? "Eligible" : "Not Eligible"
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    theme: "striped",
    head: [["Record", "Farmer", "Plot", "Final Credits", "Revenue", "Status"]],
    body: sampleRows,
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [20, 42, 32], textColor: [240, 248, 240] },
    alternateRowStyles: { fillColor: [248, 250, 246] }
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(9);
  doc.setTextColor(90, 100, 92);
  doc.text(
    "This report is generated from the project database and intended for certification review.",
    40,
    pageHeight - 24
  );

  const safeFarmer = String(selectedRecord.farmer || "farmer").replace(/\s+/g, "-").toLowerCase();
  const safePlot = String(selectedRecord.plotId || "plot");
  const timestamp = generatedOn.toISOString().replace(/[:.]/g, "-");
  doc.save(`certification-report-${safeFarmer}-plot-${safePlot}-${timestamp}.pdf`);
}
