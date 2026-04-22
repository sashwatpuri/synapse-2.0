import { formatNumber } from "../services/carbonService";

export function TraceabilityTable({ records, onRefresh }) {
  return (
    <section className="section reveal" style={{ animationDelay: "0.45s" }}>
      <div className="section-header">
        <div>
          <h2>Traceability Table</h2>
          <p>Pipeline outputs stored as a Certification_Report-style dataset in the UI simulation layer.</p>
        </div>
        <button className="secondary" onClick={onRefresh}>Refresh Simulation</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Farmer</th>
              <th>Plot</th>
              <th>SOC</th>
              <th>CO2_eq (kg)</th>
              <th>Baseline CO2 (kg)</th>
              <th>Additional CO2 (kg)</th>
              <th>Confidence</th>
              <th>Final Credits</th>
              <th>Revenue</th>
              <th>Certification</th>
            </tr>
          </thead>
          <tbody>
            {records.map((row) => {
              const statusClass = row.isEligible ? "healthy" : (row.additionalCO2 > 0 ? "borderline" : "alert");
              return (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.farmer}</td>
                  <td>{row.plotId}</td>
                  <td>{formatNumber(row.soc, 2)}</td>
                  <td>{formatNumber(row.co2Eq, 2)}</td>
                  <td>{formatNumber(row.baseCO2, 2)}</td>
                  <td>{formatNumber(row.additionalCO2, 2)}</td>
                  <td>{formatNumber(row.confidence * 100, 2)}%</td>
                  <td>{formatNumber(row.finalCredits, 4)}</td>
                  <td>${formatNumber(row.revenue, 2)}</td>
                  <td className={`table-status ${statusClass}`}>{row.isEligible ? "Eligible" : "Not Eligible"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="footnote">
        RBAC behavior: Admin can trigger certification actions. Data Analyst can analyze and export but cannot trigger certification.
      </p>
    </section>
  );
}
