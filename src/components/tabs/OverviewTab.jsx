import { SummaryCards } from "./SummaryCards";
import { SqlQueryViewerPanel } from "./SqlQueryViewerPanel";

export function OverviewTab({ 
  summary, 
  selectedPlot, 
  selectedFarmer, 
  isLoading, 
  loadError, 
  databaseInfo 
}) {
  return (
    <div className="tab-content">
      <section className="section reveal">
        <div className="section-header">
          <div>
            <h2>Database Integration</h2>
            <p>Data loaded from your SQL schema and CSV tables in public/data.</p>
          </div>
        </div>
        {isLoading && <p className="metric-sub">Loading database files...</p>}
        {!isLoading && loadError && <p className="metric-sub" style={{ color: "var(--danger)" }}>{loadError}</p>}
        {!isLoading && !loadError && databaseInfo && (
          <div className="cards" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
            <div className="card"><h3>Farmers</h3><div className="metric">{databaseInfo.farmers}</div></div>
            <div className="card"><h3>Plots</h3><div className="metric">{databaseInfo.plots}</div></div>
            <div className="card"><h3>Sensor Readings</h3><div className="metric">{databaseInfo.sensorReadings}</div></div>
            <div className="card"><h3>SQL Schema Lines</h3><div className="metric">{databaseInfo.schemaLines}</div></div>
          </div>
        )}
      </section>

      <SqlQueryViewerPanel
        selectedPlot={selectedPlot}
        selectedFarmer={selectedFarmer}
      />

      <SummaryCards summary={summary} />
    </div>
  );
}
