function escapeSqlText(value) {
  return String(value).replace(/'/g, "''");
}

export function buildDashboardQueries({ selectedPlot, selectedFarmer }) {
  const plotId = Number(selectedPlot) || 1;
  const hasFarmerFilter = selectedFarmer && selectedFarmer !== "All";
  const farmerWhere = hasFarmerFilter
    ? `AND f.name = '${escapeSqlText(selectedFarmer)}'`
    : "";

  return [
    {
      id: "summary-kpis",
      title: "Summary KPI Cards",
      purpose: "Total credits, final credits, revenue, and eligibility distribution.",
      sql: `SELECT
  SUM(cr.carbon_credits) AS total_credits,
  SUM(cr.carbon_credits * 0.90) AS final_credits,
  SUM(cr.carbon_credits * 0.90 * 22.00) AS estimated_revenue,
  SUM(CASE WHEN cr.eligibility_status = 'ELIGIBLE' THEN 1 ELSE 0 END) AS eligible_plots,
  COUNT(*) AS total_reports
FROM CERTIFICATION_REPORT cr
JOIN PLOT p ON p.Plot_id = cr.land_id
JOIN FARMER f ON f.Farmer_ID = p.farmer_id
WHERE cr.period_start >= '2024-01-01' ${farmerWhere};`
    },
    {
      id: "nutrient-monitor",
      title: "Soil Nutrient Monitor",
      purpose: "Latest sensor reading for selected plot.",
      sql: `SELECT sr.sensor_id, sr.timestamp, sr.pH, sr.moisture, sr.nitrogen, sr.phosphorus, sr.potassium
FROM SENSOR_READING sr
JOIN SENSOR_NODE sn ON sn.sensor_id = sr.sensor_id
WHERE sn.plot_id = ${plotId}
ORDER BY sr.timestamp DESC
LIMIT 1;`
    },
    {
      id: "soc-trend",
      title: "Soil Trend Analysis Chart",
      purpose: "Monthly average sensor values (basis for SOC trend model input).",
      sql: `SELECT
  DATE_FORMAT(sr.timestamp, '%Y-%m') AS month,
  AVG(sr.nitrogen) AS avg_n,
  AVG(sr.phosphorus) AS avg_p,
  AVG(sr.potassium) AS avg_k,
  AVG(sr.pH) AS avg_ph,
  AVG(sr.moisture) AS avg_moisture
FROM SENSOR_READING sr
JOIN SENSOR_NODE sn ON sn.sensor_id = sr.sensor_id
WHERE sn.plot_id = ${plotId}
GROUP BY DATE_FORMAT(sr.timestamp, '%Y-%m')
ORDER BY month;`
    },
    {
      id: "additionality",
      title: "Additionality Visualization",
      purpose: "Current CO2 vs baseline CO2 for selected plot.",
      sql: `WITH baseline AS (
  SELECT land_id, AVG(CO2_equivalent) AS baseline_co2
  FROM CARBON_RECORD
  WHERE land_id = ${plotId}
  GROUP BY land_id
), current_period AS (
  SELECT land_id, SUM(CO2_equivalent) AS current_co2
  FROM CARBON_RECORD
  WHERE land_id = ${plotId}
    AND period_start >= '2024-01-01'
  GROUP BY land_id
)
SELECT c.land_id, c.current_co2, b.baseline_co2,
       (c.current_co2 - b.baseline_co2) AS additional_co2
FROM current_period c
JOIN baseline b ON b.land_id = c.land_id;`
    },
    {
      id: "farmer-performance",
      title: "Farmer Performance Chart",
      purpose: "Credits and revenue per farmer for comparison.",
      sql: `SELECT
  f.Farmer_ID,
  f.name AS farmer_name,
  SUM(cr.carbon_credits * 0.90) AS final_credits,
  SUM(cr.carbon_credits * 0.90 * 22.00) AS estimated_revenue
FROM CERTIFICATION_REPORT cr
JOIN PLOT p ON p.Plot_id = cr.land_id
JOIN FARMER f ON f.Farmer_ID = p.farmer_id
WHERE cr.period_start >= '2024-01-01' ${farmerWhere}
GROUP BY f.Farmer_ID, f.name
ORDER BY final_credits DESC;`
    },
    {
      id: "certification-status",
      title: "Certification Status Pie",
      purpose: "Eligible vs non-eligible/pending report counts.",
      sql: `SELECT
  eligibility_status,
  COUNT(*) AS report_count
FROM CERTIFICATION_REPORT cr
JOIN PLOT p ON p.Plot_id = cr.land_id
JOIN FARMER f ON f.Farmer_ID = p.farmer_id
WHERE cr.period_start >= '2024-01-01' ${farmerWhere}
GROUP BY eligibility_status;`
    },
    {
      id: "traceability",
      title: "Traceability Table",
      purpose: "Certification report joined with plot and farmer details.",
      sql: `SELECT
  cr.report_id,
  f.name AS farmer,
  p.Plot_id,
  cr.total_carbon,
  cr.carbon_credits,
  (cr.carbon_credits * 0.10) AS buffer_credits,
  (cr.carbon_credits * 0.90) AS final_credits,
  cr.eligibility_status,
  cr.period_start,
  cr.period_end
FROM CERTIFICATION_REPORT cr
JOIN PLOT p ON p.Plot_id = cr.land_id
JOIN FARMER f ON f.Farmer_ID = p.farmer_id
WHERE p.Plot_id = ${plotId} ${farmerWhere}
ORDER BY cr.report_id DESC;`
    }
  ];
}
