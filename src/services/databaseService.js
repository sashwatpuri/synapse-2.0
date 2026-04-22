import Papa from "papaparse";

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function fetchCsv(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  const text = await response.text();
  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false
  });

  if (parsed.errors.length) {
    throw new Error(`CSV parse error in ${path}: ${parsed.errors[0].message}`);
  }

  return parsed.data;
}

export async function loadDatabaseAssets() {
  const [
    farmersRaw,
    plotsRaw,
    soilTypesRaw,
    sensorNodesRaw,
    sensorReadingsRaw,
    carbonRecordsRaw,
    certReportsRaw,
    schemaText
  ] = await Promise.all([
    fetchCsv("/data/FINAL_V2_FARMER.csv"),
    fetchCsv("/data/FINAL_V2_PLOT.csv"),
    fetchCsv("/data/FINAL_V2_SOIL_TYPE.csv"),
    fetchCsv("/data/FINAL_V2_SENSOR_NODE.csv"),
    fetchCsv("/data/FINAL_V2_SENSOR_READING.csv"),
    fetchCsv("/data/FINAL_V2_CARBON_RECORD.csv"),
    fetchCsv("/data/FINAL_V2_CERTIFICATION_REPORT.csv"),
    fetch("/data/database schema.sql").then((res) => {
      if (!res.ok) throw new Error("Failed to load database schema SQL");
      return res.text();
    })
  ]);

  const farmers = farmersRaw.map((row) => ({
    farmer_id: toNumber(row.farmer_id),
    name: row.name,
    contact: row.contact,
    pincode: row.pincode,
    registration_no: row.registration_no
  }));

  const plots = plotsRaw.map((row) => ({
    plot_id: toNumber(row.plot_id),
    location: row.location,
    area_hectare: toNumber(row.area_hectare),
    farmer_id: toNumber(row.farmer_id),
    soil_type: toNumber(row.soil_type),
    bulk_density_g_per_cm3: toNumber(row.bulk_density_g_per_cm3)
  }));

  const soilTypes = soilTypesRaw.map((row) => ({
    soil_type_id: toNumber(row.soil_type_id),
    type_name: row.type_name,
    carbon_retention_capacity: toNumber(row.carbon_retention_capacity)
  }));

  const sensorNodes = sensorNodesRaw.map((row) => ({
    sensor_id: toNumber(row.sensor_id),
    sensor_type: row.sensor_type,
    installation_date: row.installation_date,
    plot_id: toNumber(row.plot_id)
  }));

  const sensorReadings = sensorReadingsRaw.map((row) => ({
    sensor_id: toNumber(row.sensor_id),
    timestamp: row.timestamp,
    timestampDate: normalizeDate(row.timestamp),
    pH: toNumber(row.pH),
    moisture: toNumber(row.moisture),
    nitrogen: toNumber(row.nitrogen),
    phosphorus: toNumber(row.phosphorus),
    potassium: toNumber(row.potassium)
  }));

  const carbonRecords = carbonRecordsRaw.map((row) => ({
    carbon_id: toNumber(row.carbon_id),
    land_id: toNumber(row.land_id),
    period_start: row.period_start,
    period_end: row.period_end,
    co2_equivalent: toNumber(row.CO2_equivalent),
    calculated_on: row.calculated_on
  }));

  const certificationReports = certReportsRaw.map((row) => ({
    report_id: toNumber(row.report_id),
    land_id: toNumber(row.land_id),
    period_start: row.period_start,
    period_end: row.period_end,
    total_carbon: toNumber(row.total_carbon),
    eligibility_status: row.eligibility_status,
    issued_on: row.issued_on,
    carbon_credits: toNumber(row.carbon_credits)
  }));

  return {
    farmers,
    plots,
    soilTypes,
    sensorNodes,
    sensorReadings,
    carbonRecords,
    certificationReports,
    schemaText
  };
}
