export function HeatmapSection({ heatmapData }) {
  const cells = [];
  cells.push(<div key="empty" />);

  heatmapData.labels.forEach((label) => {
    cells.push(
      <div key={`head-${label}`} className="heatmap-cell heatmap-label">{label}</div>
    );
  });

  heatmapData.labels.forEach((row, i) => {
    cells.push(
      <div key={`row-${row}`} className="heatmap-cell heatmap-label">{row}</div>
    );

    heatmapData.matrix[i].forEach((value, j) => {
      const intensity = Math.abs(value);
      const bg = value >= 0
        ? `rgb(${Math.round(24 + 16 * (1 - intensity))}, ${Math.round(85 + 120 * intensity)}, ${Math.round(64 + 30 * intensity)})`
        : `rgb(${Math.round(118 + 120 * intensity)}, ${Math.round(62 + 30 * (1 - intensity))}, 56)`;

      cells.push(
        <div key={`cell-${i}-${j}`} className="heatmap-cell" style={{ background: bg }} title={`${row}: ${value.toFixed(2)}`}>
          {value.toFixed(2)}
        </div>
      );
    });
  });

  return (
    <div className="section reveal" style={{ animationDelay: "0.41s" }}>
      <div className="section-header">
        <div>
          <h2>Statistical Analysis Heatmap</h2>
          <p>Correlations between nutrients and SOC for trend interpretation.</p>
        </div>
      </div>
      <div className="heatmap-grid">{cells}</div>
    </div>
  );
}
