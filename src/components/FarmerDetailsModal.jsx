import { formatNumber } from "../services/carbonService";

export function FarmerDetailsModal({ profile, onClose }) {
  if (!profile) return null;

  const { farmer, plots, records, account } = profile;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-card" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Farmer details">
        <div className="section-header">
          <div>
            <h2>Farmer Details</h2>
            <p>Quick profile view from the traceability table.</p>
          </div>
          <button className="secondary" onClick={onClose}>Close</button>
        </div>

        <div className="profile-grid">
          <label className="control">
            Farmer ID
            <input value={farmer.public_farmer_uid} readOnly />
          </label>
          <label className="control">
            Name
            <input value={farmer.name} readOnly />
          </label>
          <label className="control">
            Status
            <input value={farmer.status} readOnly />
          </label>
          <label className="control">
            Contact
            <input value={farmer.contact} readOnly />
          </label>
          <label className="control">
            Registration
            <input value={farmer.registration_no} readOnly />
          </label>
          <label className="control">
            Pincode
            <input value={farmer.pincode} readOnly />
          </label>
          <label className="control">
            Village
            <input value={farmer.village || "-"} readOnly />
          </label>
          <label className="control">
            Login Username
            <input value={account?.username || "-"} readOnly />
          </label>
          <label className="control">
            Notes
            <input value={farmer.notes || "-"} readOnly />
          </label>
        </div>

        <div className="mini-stats">
          <div className="calc-box">
            <div className="label">Owned Plots</div>
            <div className="value">{plots.length}</div>
          </div>
          <div className="calc-box">
            <div className="label">Certification Records</div>
            <div className="value">{records.length}</div>
          </div>
          <div className="calc-box">
            <div className="label">Total Revenue</div>
            <div className="value">Rs {formatNumber(records.reduce((sum, row) => sum + row.revenue, 0), 2)}</div>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Plot</th>
                <th>Location</th>
                <th>Area (ha)</th>
                <th>Soil Type</th>
                <th>Bulk Density</th>
              </tr>
            </thead>
            <tbody>
              {plots.map((plot) => (
                <tr key={plot.plot_id}>
                  <td>{plot.plot_id}</td>
                  <td>{plot.location}</td>
                  <td>{plot.area_hectare}</td>
                  <td>{plot.soilTypeName}</td>
                  <td>{plot.bulk_density_g_per_cm3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Plot</th>
                <th>Period</th>
                <th>Final Credits</th>
                <th>Revenue (Rs)</th>
                <th>Certification</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.plotId}</td>
                  <td>{record.periodStart} to {record.periodEnd}</td>
                  <td>{formatNumber(record.finalCredits, 4)}</td>
                  <td>{formatNumber(record.revenue, 2)}</td>
                  <td>{record.isEligible ? "Eligible" : "Not Eligible"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
