import { API_ENDPOINTS } from "../data/dashboardData";

export async function mockFetch(endpointName, payload, delay = 50) {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return { endpoint: API_ENDPOINTS[endpointName], ...payload };
}

export function getApiContracts() {
  return [
    "POST /predict-carbon -> predict SOC, compute CO2, baseline, additionality, certification, credits, and revenue.",
    "GET /analytics/correlation -> nutrient-SOC correlation matrix.",
    "GET /analytics/trends -> SOC trend timeseries by plot/farmer/date range.",
    "GET /analytics/farmer-performance -> credits and revenue per farmer.",
    "GET /analytics/certification-status -> eligible vs non-eligible distribution."
  ];
}
