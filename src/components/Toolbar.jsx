export function Toolbar({
  role,
  selectedPlot,
  selectedFarmer,
  farmers,
  plotOptions,
  inputs,
  onRoleChange,
  onPlotChange,
  onFarmerChange,
  onInputChange,
  onNudgeSensors,
  onExport
}) {
  return (
    <section className="toolbar reveal" style={{ animationDelay: "0.05s" }}>
      <label className="control">
        Active role
        <select value={role} onChange={(event) => onRoleChange(event.target.value)}>
          <option value="admin">Admin / Certifying Authority</option>
          <option value="analyst">Data Analyst</option>
        </select>
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
        <select value={selectedFarmer} onChange={(event) => onFarmerChange(event.target.value)}>
          {farmers.map((farmer) => (
            <option key={farmer} value={farmer}>{farmer}</option>
          ))}
        </select>
      </label>

      <label className="control">
        Price per credit ($)
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
    </section>
  );
}
