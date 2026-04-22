import { beta } from "../data/dashboardData";

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function randomSpread(range) {
  return (Math.random() - 0.5) * range * 2;
}

export function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

export function formatNumber(value, digits = 2) {
  return round(value, digits).toFixed(digits);
}

export function estimateSoc(sensorValues) {
  const raw = beta.intercept
    + beta.N * sensorValues.N
    + beta.P * sensorValues.P
    + beta.K * sensorValues.K
    + beta.Moisture * sensorValues.Moisture
    + beta.pH * sensorValues.pH;
  return clamp(raw, 0.7, 7.5);
}

export function baselineCO2(plot) {
  return plot.baselineHistoryCO2.reduce((sum, value) => sum + value, 0) / plot.baselineHistoryCO2.length;
}

export function calculatePipeline({ soc, plot, inputs }) {
  const socStock = soc * inputs.bulkDensity * inputs.depth * inputs.area;
  const co2Eq = socStock * 3.67;
  const baseCO2 = baselineCO2(plot);
  const additionalCO2 = co2Eq - baseCO2;
  const credits = Math.max(additionalCO2, 0) / 1000;
  const meanSoc = plot.monthlySoc.reduce((sum, value) => sum + value, 0) / plot.monthlySoc.length;
  const confidence = clamp(1 - (inputs.rmse / meanSoc), 0, 1);
  const isEligible = additionalCO2 > 0 && confidence > 0.95;
  const buffer = credits * 0.1;
  const finalCredits = credits - buffer;
  const revenue = finalCredits * inputs.pricePerCredit;

  return {
    soc,
    socStock,
    co2Eq,
    baseCO2,
    additionalCO2,
    credits,
    confidence,
    isEligible,
    buffer,
    finalCredits,
    revenue
  };
}

export function statusForSensor(value, def) {
  if (value >= def.healthyMin && value <= def.healthyMax) return "Healthy";
  if (Math.abs(value - def.healthyMin) < (def.healthyMax - def.healthyMin) * 0.4 || Math.abs(value - def.healthyMax) < (def.healthyMax - def.healthyMin) * 0.4) {
    return "Borderline";
  }
  return "Alert";
}

export function gaugeColor(value, def) {
  if (value >= def.healthyMin && value <= def.healthyMax) {
    return "linear-gradient(90deg,#4dd388,#2eb76d)";
  }
  if (value < def.healthyMin || value > def.healthyMax) {
    return "linear-gradient(90deg,#efc061,#d89a3f)";
  }
  return "linear-gradient(90deg,#f07b70,#dc5f54)";
}
