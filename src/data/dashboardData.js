export const API_ENDPOINTS = {
  predictCarbon: "/predict-carbon",
  correlations: "/analytics/correlation",
  trends: "/analytics/trends",
  farmerPerformance: "/analytics/farmer-performance",
  certificationStatus: "/analytics/certification-status"
};

export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const plots = [
  {
    id: "Plot A",
    farmer: "Farmer Raina",
    thresholdSoc: 2.4,
    area: 12,
    monthlySoc: [1.62, 1.69, 1.75, 1.82, 1.88, 1.94, 2.02, 2.1, 2.17, 2.21, 2.28, 2.35],
    baselineHistoryCO2: [1012, 1046, 1091, 1122, 1104],
    rmse: 0.05
  },
  {
    id: "Plot B",
    farmer: "Farmer Iqbal",
    thresholdSoc: 2.1,
    area: 10,
    monthlySoc: [1.42, 1.47, 1.52, 1.56, 1.61, 1.67, 1.72, 1.77, 1.81, 1.87, 1.92, 1.98],
    baselineHistoryCO2: [930, 942, 955, 968, 962],
    rmse: 0.07
  },
  {
    id: "Plot C",
    farmer: "Farmer Leela",
    thresholdSoc: 2.7,
    area: 14,
    monthlySoc: [1.88, 1.93, 2.0, 2.08, 2.13, 2.19, 2.25, 2.32, 2.38, 2.44, 2.52, 2.6],
    baselineHistoryCO2: [1195, 1220, 1232, 1255, 1264],
    rmse: 0.04
  },
  {
    id: "Plot D",
    farmer: "Farmer Anaya",
    thresholdSoc: 1.95,
    area: 8,
    monthlySoc: [1.13, 1.19, 1.25, 1.29, 1.34, 1.4, 1.45, 1.5, 1.57, 1.61, 1.68, 1.74],
    baselineHistoryCO2: [788, 804, 816, 822, 831],
    rmse: 0.08
  }
];

export const sensorDefs = [
  { key: "N", label: "Nitrogen (N)", min: 0, max: 100, healthyMin: 35, healthyMax: 75, unit: "ppm" },
  { key: "P", label: "Phosphorus (P)", min: 0, max: 80, healthyMin: 18, healthyMax: 45, unit: "ppm" },
  { key: "K", label: "Potassium (K)", min: 0, max: 120, healthyMin: 40, healthyMax: 85, unit: "ppm" },
  { key: "pH", label: "pH", min: 4.5, max: 8.5, healthyMin: 6, healthyMax: 7.5, unit: "" },
  { key: "Moisture", label: "Moisture", min: 0, max: 100, healthyMin: 28, healthyMax: 58, unit: "%" }
];

export const beta = {
  N: 0.01,
  P: 0.008,
  K: 0.006,
  Moisture: 0.015,
  pH: 0.28,
  intercept: 0.85
};

export const heatmapData = {
  labels: ["N", "P", "K", "pH", "Moisture", "SOC"],
  matrix: [
    [1.0, 0.61, 0.54, -0.16, 0.33, 0.69],
    [0.61, 1.0, 0.41, -0.22, 0.27, 0.56],
    [0.54, 0.41, 1.0, -0.14, 0.32, 0.51],
    [-0.16, -0.22, -0.14, 1.0, -0.45, -0.28],
    [0.33, 0.27, 0.32, -0.45, 1.0, 0.74],
    [0.69, 0.56, 0.51, -0.28, 0.74, 1.0]
  ]
};
