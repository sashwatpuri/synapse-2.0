export function NutrientSection({ nutrientDisplay }) {
  return (
    <div className="section reveal" style={{ animationDelay: "0.24s" }}>
      <div className="section-header">
        <div>
          <h2>Soil Nutrient Monitor</h2>
          <p>Realtime sensor indicators (N, P, K, pH, Moisture) for selected plot.</p>
        </div>
      </div>

      <div className="nutrient-grid">
        {nutrientDisplay.map((item) => (
          <article key={item.key} className="gauge">
            <div className="gauge-top">
              <strong>{item.label}</strong>
              <span>{item.valueText}</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${item.percent}%`, background: item.color }} />
            </div>
            <div className="range">
              <span>Min {item.min}</span>
              <span
                style={{
                  color:
                    item.status === "Healthy"
                      ? "var(--success)"
                      : item.status === "Borderline"
                        ? "var(--warning)"
                        : "var(--danger)"
                }}
              >
                {item.status}
              </span>
              <span>Max {item.max}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
