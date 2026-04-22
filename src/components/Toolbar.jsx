export function Toolbar({
  user,
  selectedPlot,
  selectedFarmerId,
  farmerOptions,
  plotOptions,
  inputs,
  onPlotChange,
  onFarmerChange,
  onInputChange,
  onNudgeSensors,
  onExport,
  onExportPdf,
  onLogout
}) {
  const role = user?.role || "guest";
  const isFarmer = role === "farmer";

  return (
    <section className="toolbar reveal" style={{ animationDelay: "0.05s" }}>
      <label className="control">
        Active User
        <input value={user ? `${user.username} (${role})` : "Guest"} readOnly />
      </label>

      <label className="control">
        Plot
        <select value={selectedPlot} onChange={(event) => onPlotChange(event.target.value)}>
          {plotOptions.map((plot) => (
            <option key={plot.id} value={plot.id}>{plot.label}</option>
          ))}
        </select>
      </label>

      <label className="control">
        Farmer
        <select value={selectedFarmerId} onChange={(event) => onFarmerChange(event.target.value)} disabled={isFarmer}>
          {farmerOptions.map((farmer) => (
            <option key={farmer.id} value={farmer.id}>{farmer.label}</option>
          ))}
        </select>
      </label>

      <label className="control">
        Price per credit (Rs)
        <input
          type="number"
          min="1"
          max="500"
          step="1"
          value={inputs.pricePerCredit}
          onChange={(event) => onInputChange("pricePerCredit", event.target.value)}
        />
      </label>

      <button className="secondary" onClick={onNudgeSensors}>Sensor Burst</button>
      <button className="export" onClick={onExport}>Download CSV</button>
      <button className="export" onClick={onExportPdf}>Download PDF Report</button>
      <button className="secondary" onClick={onLogout}>Logout</button>
    </section>
  );
}
