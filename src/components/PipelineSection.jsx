export function PipelineSection({ role, inputs, onInputChange, calcCards, eligibilityState, onRunCertification }) {
  const isAdmin = role === "admin";

  return (
    <div className="section reveal" style={{ animationDelay: "0.39s" }}>
      <div className="section-header">
        <div>
          <h2>Carbon Pipeline Engine</h2>
          <p>Implements SOC_stock, CO2_eq, baseline, additionality, credits, confidence, buffer, and revenue.</p>
        </div>
        <div>
          <button onClick={onRunCertification} disabled={!isAdmin}>Trigger Certification</button>
        </div>
      </div>

      <div className="toolbar" style={{ position: "static", top: "auto", padding: 0, border: 0, background: "none", backdropFilter: "none" }}>
        <label className="control">
          Bulk Density (g/cm3)
          <input type="number" min="0.8" max="2" step="0.01" value={inputs.bulkDensity} onChange={(event) => onInputChange("bulkDensity", event.target.value)} />
        </label>
        <label className="control">
          Depth (cm)
          <input type="number" min="5" max="100" step="1" value={inputs.depth} onChange={(event) => onInputChange("depth", event.target.value)} />
        </label>
        <label className="control">
          Area (ha)
          <input type="number" min="0.1" max="200" step="0.1" value={inputs.area} onChange={(event) => onInputChange("area", event.target.value)} />
        </label>
        <label className="control">
          RMSE
          <input type="number" min="0.01" max="2" step="0.01" value={inputs.rmse} onChange={(event) => onInputChange("rmse", event.target.value)} />
        </label>
      </div>

      <div className="calc-grid">
        {calcCards.map((item) => (
          <div key={item.label} className="calc-box">
            <div className="label">{item.label}</div>
            <div className="value">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="eligibility-row">
        <span className={`badge ${eligibilityState.className}`}>{eligibilityState.label}</span>
        <span className="metric-sub">{eligibilityState.details}</span>
      </div>
    </div>
  );
}
