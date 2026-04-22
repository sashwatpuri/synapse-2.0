import { formatNumber } from "../services/carbonService";

export function TraceabilityTable({ records, onRefresh, onSelectFarmer }) {
  return (
    <section className="section reveal" style={{ animationDelay: "0.45s" }}>
      <div className="section-header">
        <div>
          <h2>Traceability Table</h2>
          <p>Each record is tied to a farmer profile, plot, certification status, and revenue outcome.</p>
        </div>
        <button className="secondary" onClick={onRefresh}>Refresh Simulation</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Farmer ID</th>
              <th>Farmer</th>
              <th>Plot</th>
              <th>Location</th>
              <th>Status</th>
              <th>CO2_eq (kg)</th>
              <th>Final Credits</th>
              <th>Revenue (Rs)</th>
              <th>Certification</th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            {records.map((row) => {
              const statusClass = row.isEligible ? "healthy" : (row.additionalCO2 > 0 ? "borderline" : "alert");
              return (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.publicFarmerId}</td>
                  <td>{row.farmer}</td>
                  <td>{row.plotId}</td>
                  <td>{row.plotLocation}</td>
                  <td>{row.farmerStatus}</td>
                  <td>{formatNumber(row.co2Eq, 2)}</td>
                  <td>{formatNumber(row.finalCredits, 4)}</td>
                  <td>{formatNumber(row.revenue, 2)}</td>
                  <td className={`table-status ${statusClass}`}>{row.isEligible ? "Eligible" : "Not Eligible"}</td>
                  <td>
                    <button className="secondary inline-button" onClick={() => onSelectFarmer?.(String(row.farmerId))}>
                      View Farmer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="footnote">
        Admin can inspect every farmer. Farmer accounts remain locked to their own profile and plot records.
      </p>
    </section>
  );
}
