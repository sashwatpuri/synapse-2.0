import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatNumber } from "./carbonService";

export function exportCertificationPdf({ selectedRecord, role }) {
  if (!selectedRecord) return;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const generatedOn = new Date();

  doc.setFillColor(16, 40, 29);
  doc.rect(0, 0, 595, 120, "F");

  doc.setTextColor(239, 248, 238);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Soil Carbon Credit Certificate", 40, 44);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Certificate ID: ${selectedRecord.certificateId}`, 40, 68);
  doc.text(`Verification Code: ${selectedRecord.verificationCode}`, 40, 84);
  doc.text(`Generated: ${generatedOn.toLocaleString()}`, 40, 100);

  const statusColor = selectedRecord.certificateStatus === "ISSUED" ? [46, 140, 87] : [199, 162, 95];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(410, 36, 145, 30, 8, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(selectedRecord.certificateStatus.replace("_", " "), 435, 56);

  doc.setTextColor(30, 45, 34);
  autoTable(doc, {
    startY: 138,
    theme: "grid",
    head: [["Certificate Field", "Value"]],
    body: [
      ["Farmer Name", selectedRecord.farmer],
      ["Farmer ID", selectedRecord.publicFarmerId],
      ["Plot ID", `Plot ${selectedRecord.plotId}`],
      ["Plot Location", selectedRecord.plotLocation],
      ["Reporting Period", `${selectedRecord.periodStart} to ${selectedRecord.periodEnd}`],
      ["Issued By", role === "admin" ? "Admin Authority" : "Farmer Portal"],
      ["Verifier", selectedRecord.verifierName],
      ["Issue Date", selectedRecord.certificateIssuedOn || "-"],
      ["Valid Until", selectedRecord.certificateValidUntil || "-"]
    ],
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [20, 42, 32], textColor: [240, 248, 240] }
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    theme: "grid",
    head: [["Certified Metric", "Value"]],
    body: [
      ["Final Credits", formatNumber(selectedRecord.finalCredits, 4)],
      ["Carbon Credits", formatNumber(selectedRecord.credits, 4)],
      ["Buffer Credits (10%)", formatNumber(selectedRecord.buffer, 4)],
      ["CO2 Equivalent (kg)", formatNumber(selectedRecord.co2Eq, 2)],
      ["SOC (%)", formatNumber(selectedRecord.soc, 2)],
      ["Confidence", `${formatNumber(selectedRecord.confidence * 100, 2)}%`],
      ["Estimated Revenue", `Rs ${formatNumber(selectedRecord.revenue, 2)}`],
      ["Certification Decision", selectedRecord.isEligible ? "Eligible" : "Under Review / Not Eligible"]
    ],
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [90, 107, 73], textColor: [255, 255, 255] }
  });

  doc.setFontSize(11);
  doc.setFont("helvetica", "italic");
  doc.text(
    selectedRecord.approvalNotes || "This certificate is generated from the selected certification record.",
    40,
    doc.lastAutoTable.finalY + 30
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Authorized Signatory: ____________________", 40, doc.lastAutoTable.finalY + 72);

  const safeFarmer = String(selectedRecord.farmer || "farmer").replace(/\s+/g, "-").toLowerCase();
  doc.save(`certificate-${selectedRecord.certificateId}-${safeFarmer}.pdf`);
}
