import { getApiContracts } from "../services/mockApi";

export function ApiContractsSection() {
  const contracts = getApiContracts();

  return (
    <div className="section reveal" style={{ animationDelay: "0.43s" }}>
      <div className="section-header">
        <div>
          <h2>API Integration Contracts</h2>
          <p>Frontend contracts aligned with FastAPI service design.</p>
        </div>
      </div>

      <ul className="api-list">
        {contracts.map((contract) => (
          <li key={contract}>{contract}</li>
        ))}
      </ul>

      <p className="footnote">
        This phase uses mock adapters that mirror endpoint payloads, so swapping to real FastAPI APIs later only changes the service layer.
      </p>
    </div>
  );
}
