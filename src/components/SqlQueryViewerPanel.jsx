import { useMemo, useState } from "react";
import { buildDashboardQueries } from "../services/sqlQueryCatalog";

export function SqlQueryViewerPanel({ selectedPlot, selectedFarmer }) {
  const queries = useMemo(
    () => buildDashboardQueries({ selectedPlot, selectedFarmer }),
    [selectedPlot, selectedFarmer]
  );

  const [activeQueryId, setActiveQueryId] = useState("summary-kpis");

  const activeQuery = queries.find((q) => q.id === activeQueryId) || queries[0];

  const copyActiveQuery = async () => {
    try {
      await navigator.clipboard.writeText(activeQuery.sql);
    } catch {
      // Ignore clipboard errors in unsupported environments.
    }
  };

  return (
    <section className="section reveal" style={{ animationDelay: "0.1s" }}>
      <details className="sql-panel">
        <summary className="sql-summary">
          <div>
            <h2>SQL Query Viewer</h2>
            <p>
              Academic USP: each dashboard view is traceable to the SQL powering it.
            </p>
          </div>
          <span className="badge amber">Collapsible</span>
        </summary>

        <div className="sql-controls">
          <label className="control">
            Dashboard view
            <select value={activeQueryId} onChange={(event) => setActiveQueryId(event.target.value)}>
              {queries.map((query) => (
                <option key={query.id} value={query.id}>{query.title}</option>
              ))}
            </select>
          </label>
          <button className="secondary" onClick={copyActiveQuery}>Copy SQL</button>
        </div>

        <p className="metric-sub sql-purpose">{activeQuery.purpose}</p>
        <pre className="sql-code" aria-label={`SQL for ${activeQuery.title}`}>
{activeQuery.sql}
        </pre>
      </details>
    </section>
  );
}
