import { formatNumber } from "./carbonService";

export function exportRecordsCsv(records) {
  if (!records.length) return;

  const headers = [
    "Record ID", "Farmer ID", "Farmer", "Plot", "Location", "CO2_eq", "Final Credits", "Revenue", "Certification"
  ];

  const csvRows = records.map((row) => [
    row.id,
    row.publicFarmerId,
    row.farmer,
    row.plotId,
    row.plotLocation,
    formatNumber(row.co2Eq, 2),
    formatNumber(row.finalCredits, 4),
    `Rs ${formatNumber(row.revenue, 2)}`,
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
