import { formatNumber } from "./carbonService";

export function exportRecordsCsv(records) {
  if (!records.length) return;

  const headers = [
    "Record ID", "Farmer", "Plot", "SOC", "CO2_eq", "Baseline CO2", "Additional CO2", "Confidence", "Final Credits", "Revenue", "Certification"
  ];

  const csvRows = records.map((row) => [
    row.id,
    row.farmer,
    row.plotId,
    formatNumber(row.soc, 2),
    formatNumber(row.co2Eq, 2),
    formatNumber(row.baseCO2, 2),
    formatNumber(row.additionalCO2, 2),
    `${formatNumber(row.confidence * 100, 2)}%`,
    formatNumber(row.finalCredits, 4),
    formatNumber(row.revenue, 2),
    row.isEligible ? "Eligible" : "Not Eligible"
  ]);

  const csv = [headers, ...csvRows]
    .map((line) => line.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `carbon-report-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
