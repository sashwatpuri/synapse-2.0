import { useCallback, useEffect, useMemo, useState } from "react";
import { heatmapData, months, sensorDefs } from "../data/dashboardData";
import {
  clamp,
  estimateSoc,
  formatNumber,
  gaugeColor,
  statusForSensor
} from "../services/carbonService";
import { loadDatabaseAssets } from "../services/databaseService";
import { useInterval } from "./useInterval";

const initialSensors = {
  N: 57,
  P: 29,
  K: 64,
  pH: 6.7,
  Moisture: 42
};

const initialInputs = {
  bulkDensity: 1.25,
  depth: 30,
  area: 12,
  rmse: 0.06,
  pricePerCredit: 22
};

export function useDashboardData() {
  const [db, setDb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [role, setRole] = useState("admin");
  const [selectedPlot, setSelectedPlot] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState("All");
  const [inputs, setInputs] = useState(initialInputs);
  const [sensors, setSensors] = useState(initialSensors);
  const [eligibilityState, setEligibilityState] = useState({
    label: "PENDING REVIEW",
    className: "amber",
    details: "Admin can trigger certification workflow. Analyst role remains read-only."
  });

  useEffect(() => {
    let active = true;
    async function hydrate() {
      try {
        const assets = await loadDatabaseAssets();
        if (!active) return;
        setDb(assets);
        const firstPlot = assets.plots[0];
        if (firstPlot) {
          setSelectedPlot(String(firstPlot.plot_id));
          setInputs((prev) => ({
            ...prev,
            area: firstPlot.area_hectare,
            bulkDensity: firstPlot.bulk_density_g_per_cm3
          }));
        }
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load database files");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    hydrate();
    return () => {
      active = false;
    };
  }, []);

  const farmers = useMemo(() => {
    if (!db) return ["All"];
    return ["All", ...Array.from(new Set(db.farmers.map((farmer) => farmer.name)))];
  }, [db]);

  const plotOptions = useMemo(() => {
    if (!db) return [];
    return db.plots.map((plot) => ({
      id: String(plot.plot_id),
      label: `Plot ${plot.plot_id}`
    }));
  }, [db]);

  const farmerById = useMemo(() => {
    if (!db) return new Map();
    return new Map(db.farmers.map((farmer) => [farmer.farmer_id, farmer]));
  }, [db]);

  const soilById = useMemo(() => {
    if (!db) return new Map();
    return new Map(db.soilTypes.map((soil) => [soil.soil_type_id, soil]));
  }, [db]);

  const plotById = useMemo(() => {
    if (!db) return new Map();
    return new Map(db.plots.map((plot) => [plot.plot_id, plot]));
  }, [db]);

  const currentPlot = useMemo(
    () => {
      if (!db || !selectedPlot) return null;
      return plotById.get(Number(selectedPlot)) || null;
    },
    [db, plotById, selectedPlot]
  );

  const filteredPlots = useMemo(
    () => {
      if (!db) return [];
      if (selectedFarmer === "All") return db.plots;
      return db.plots.filter((plot) => farmerById.get(plot.farmer_id)?.name === selectedFarmer);
    },
    [db, farmerById, selectedFarmer]
  );

  const records = useMemo(
    () => {
      if (!db) return [];

      const allowedPlotIds = new Set(filteredPlots.map((plot) => plot.plot_id));
      const avgCarbonByLand = db.carbonRecords.reduce((acc, row) => {
        if (!allowedPlotIds.has(row.land_id)) return acc;
        if (!acc[row.land_id]) {
          acc[row.land_id] = { sum: 0, count: 0 };
        }
        acc[row.land_id].sum += row.co2_equivalent;
        acc[row.land_id].count += 1;
        return acc;
      }, {});

      return db.certificationReports
        .filter((report) => allowedPlotIds.has(report.land_id))
        .map((report) => {
          const plot = plotById.get(report.land_id);
          const farmer = plot ? farmerById.get(plot.farmer_id) : null;
          const baseline = avgCarbonByLand[report.land_id]
            ? avgCarbonByLand[report.land_id].sum / Math.max(avgCarbonByLand[report.land_id].count, 1)
            : 0;
          const co2Eq = report.total_carbon;
          const additionalCO2 = co2Eq - baseline;
          const credits = report.carbon_credits;
          const buffer = credits * 0.1;
          const finalCredits = credits - buffer;
          const revenue = finalCredits * inputs.pricePerCredit;
          const confidence = report.eligibility_status === "ELIGIBLE" ? 0.97 : report.eligibility_status === "PENDING" ? 0.95 : 0.92;
          const socStock = co2Eq / 3.67;
          const area = plot?.area_hectare || 1;
          const bulkDensity = plot?.bulk_density_g_per_cm3 || 1.25;
          const depth = inputs.depth || 30;
          const soc = socStock / Math.max(area * bulkDensity * depth, 0.0001);

          return {
            id: `R-${String(report.report_id).padStart(4, "0")}`,
            reportId: report.report_id,
            farmer: farmer?.name || "Unknown",
            plotId: String(report.land_id),
            periodStart: report.period_start,
            periodEnd: report.period_end,
            soc,
            socStock,
            co2Eq,
            baseCO2: baseline,
            additionalCO2,
            credits,
            confidence,
            isEligible: report.eligibility_status === "ELIGIBLE",
            status: report.eligibility_status,
            buffer,
            finalCredits,
            revenue
          };
        });
    },
    [db, farmerById, filteredPlots, inputs.depth, inputs.pricePerCredit, plotById]
  );

  const selectedRecord = useMemo(
    () => records.find((record) => record.plotId === selectedPlot) || records[0],
    [records, selectedPlot]
  );

  const summary = useMemo(() => {
    const totalCredits = records.reduce((sum, row) => sum + row.credits, 0);
    const finalCredits = records.reduce((sum, row) => sum + row.finalCredits, 0);
    const totalRevenue = records.reduce((sum, row) => sum + row.revenue, 0);
    const avgSoc = records.reduce((sum, row) => sum + row.soc, 0) / Math.max(records.length, 1);
    const eligibleCount = records.filter((row) => row.isEligible).length;

    return {
      totalCredits,
      finalCredits,
      totalRevenue,
      avgSoc,
      eligibleCount,
      totalCount: records.length,
      farmerCount: new Set(records.map((row) => row.farmer)).size
    };
  }, [records]);

  const nutrientDisplay = useMemo(
    () =>
      sensorDefs.map((def) => {
        const value = sensors[def.key];
        const percent = clamp(((value - def.min) / (def.max - def.min)) * 100, 0, 100);
        const status = statusForSensor(value, def);

        return {
          ...def,
          value,
          valueText: `${formatNumber(value, def.key === "pH" ? 2 : 1)} ${def.unit}`.trim(),
          percent,
          status,
          color: gaugeColor(value, def)
        };
      }),
    [sensors]
  );

  useEffect(() => {
    if (!db || !selectedPlot) return;

    const plotId = Number(selectedPlot);
    const nodes = db.sensorNodes.filter((node) => node.plot_id === plotId);
    const sensorIds = new Set(nodes.map((node) => node.sensor_id));
    const readings = db.sensorReadings
      .filter((row) => sensorIds.has(row.sensor_id) && row.timestampDate)
      .sort((a, b) => b.timestampDate - a.timestampDate);

    const latest = readings[0];
    if (!latest) return;

    setSensors({
      N: latest.nitrogen,
      P: latest.phosphorus,
      K: latest.potassium,
      pH: latest.pH,
      Moisture: latest.moisture
    });
  }, [db, selectedPlot]);

  const trendData = useMemo(
    () => {
      const monthly = Array.from({ length: 12 }, () => null);
      if (db && selectedPlot) {
        const plotId = Number(selectedPlot);
        const nodes = db.sensorNodes.filter((node) => node.plot_id === plotId);
        const sensorIds = new Set(nodes.map((node) => node.sensor_id));
        const readings = db.sensorReadings.filter((row) => sensorIds.has(row.sensor_id) && row.timestampDate);

        const grouped = readings.reduce((acc, row) => {
          const monthIndex = row.timestampDate.getMonth();
          if (!acc[monthIndex]) {
            acc[monthIndex] = [];
          }
          acc[monthIndex].push(row);
          return acc;
        }, {});

        Object.entries(grouped).forEach(([monthIndexStr, monthRows]) => {
          const monthIndex = Number(monthIndexStr);
          const avg = monthRows.reduce(
            (sum, row) => ({
              n: sum.n + row.nitrogen,
              p: sum.p + row.phosphorus,
              k: sum.k + row.potassium,
              ph: sum.ph + row.pH,
              m: sum.m + row.moisture
            }),
            { n: 0, p: 0, k: 0, ph: 0, m: 0 }
          );
          const count = Math.max(monthRows.length, 1);
          monthly[monthIndex] = estimateSoc({
            N: avg.n / count,
            P: avg.p / count,
            K: avg.k / count,
            pH: avg.ph / count,
            Moisture: avg.m / count
          });
        });
      }

      const threshold = selectedRecord ? selectedRecord.soc * 1.05 : 2.0;
      return {
        labels: months,
        datasets: [
          {
            label: "SOC (%)",
            data: monthly,
            borderColor: "#87d39a",
            backgroundColor: "rgba(135,211,154,0.16)",
            borderWidth: 3,
            fill: true,
            tension: 0.3,
            pointRadius: 3
          },
          {
            label: "Threshold",
            data: months.map(() => threshold),
            borderColor: "#c7a25f",
            borderDash: [6, 4],
            borderWidth: 2,
            pointRadius: 0,
            fill: false
          }
        ]
      };
    },
    [db, selectedPlot, selectedRecord]
  );

  const additionalityData = useMemo(
    () => ({
      labels: [selectedPlot ? `Plot ${selectedPlot}` : "Plot"],
      datasets: [
        {
          label: "Baseline CO2",
          data: [selectedRecord?.baseCO2 || 0],
          backgroundColor: "rgba(199, 162, 95, 0.74)",
          borderRadius: 8
        },
        {
          label: "Current CO2",
          data: [selectedRecord?.co2Eq || 0],
          backgroundColor: "rgba(135, 211, 154, 0.78)",
          borderRadius: 8
        }
      ]
    }),
    [selectedPlot, selectedRecord]
  );

  const farmerPerformanceData = useMemo(() => {
    const groups = records.reduce((acc, row) => {
      acc[row.farmer] = (acc[row.farmer] || 0) + row.finalCredits;
      return acc;
    }, {});

    return {
      labels: Object.keys(groups),
      datasets: [
        {
          label: "Final Credits",
          data: Object.values(groups),
          backgroundColor: "rgba(121, 191, 111, 0.84)",
          borderRadius: 8
        }
      ]
    };
  }, [records]);

  const certificationData = useMemo(
    () => ({
      labels: ["Eligible", "Non-Eligible/Pending"],
      datasets: [
        {
          data: [summary.eligibleCount, summary.totalCount - summary.eligibleCount],
          backgroundColor: ["rgba(138, 233, 161, 0.88)", "rgba(240, 123, 112, 0.84)"],
          borderColor: ["rgba(138, 233, 161, 1)", "rgba(240, 123, 112, 1)"],
          borderWidth: 1.5
        }
      ]
    }),
    [summary]
  );

  const calcCards = useMemo(() => {
    if (!selectedRecord) return [];
    return [
      { label: "SOC (%)", value: formatNumber(selectedRecord.soc, 2) },
      { label: "SOC_stock", value: formatNumber(selectedRecord.socStock, 2) },
      { label: "CO2_eq (kg)", value: formatNumber(selectedRecord.co2Eq, 2) },
      { label: "Baseline CO2 (kg)", value: formatNumber(selectedRecord.baseCO2, 2) },
      { label: "Additional CO2 (kg)", value: formatNumber(selectedRecord.additionalCO2, 2) },
      { label: "Carbon Credits", value: formatNumber(selectedRecord.credits, 4) },
      { label: "Confidence", value: `${formatNumber(selectedRecord.confidence * 100, 2)}%` },
      { label: "Buffer (10%)", value: formatNumber(selectedRecord.buffer, 4) },
      { label: "Revenue (₹)", value: formatNumber(selectedRecord.revenue, 2) }
    ];
  }, [selectedRecord]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#c9dbc9" } },
        tooltip: {
          backgroundColor: "#0f1f17",
          titleColor: "#ecf8eb",
          bodyColor: "#d2e6d1",
          borderColor: "rgba(166, 215, 162, 0.25)",
          borderWidth: 1
        }
      },
      scales: {
        x: { ticks: { color: "#c9dbc9" }, grid: { color: "rgba(180,210,180,0.12)" } },
        y: { ticks: { color: "#c9dbc9" }, grid: { color: "rgba(180,210,180,0.12)" } }
      }
    }),
    []
  );

  const pieOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#c9dbc9" } },
        tooltip: {
          backgroundColor: "#0f1f17",
          titleColor: "#ecf8eb",
          bodyColor: "#d2e6d1"
        }
      }
    }),
    []
  );

  const onRoleChange = useCallback((value) => {
    setRole(value);
    if (value === "analyst") {
      setEligibilityState({
        label: "ANALYST MODE",
        className: "amber",
        details: "Read-only analytical access active. Certification trigger is restricted to Admin role."
      });
    }
  }, []);

  const onPlotChange = useCallback((value) => {
    setSelectedPlot(value);
    const plot = db?.plots.find((item) => String(item.plot_id) === value);
    if (!plot) return;
    setInputs((prev) => ({
      ...prev,
      area: plot.area_hectare,
      bulkDensity: plot.bulk_density_g_per_cm3
    }));
  }, [db]);

  const onInputChange = useCallback((key, value) => {
    setInputs((prev) => ({
      ...prev,
      [key]: Number(value)
    }));
  }, []);

  const nudgeSensors = useCallback(() => {
    setSensors((prev) => {
      const next = { ...prev };
      sensorDefs.forEach((def) => {
        const spread = def.key === "pH" ? 0.06 : def.max * 0.01;
        next[def.key] = clamp(prev[def.key] + ((Math.random() - 0.5) * spread * 2), def.min, def.max);
      });
      return next;
    });
  }, []);

  const runCertification = useCallback(() => {
    if (role !== "admin" || !selectedRecord) return;
    const eligible = selectedRecord.isEligible;
    setEligibilityState({
      label: eligible ? "ELIGIBLE" : "NOT ELIGIBLE",
      className: eligible ? "green" : "red",
      details: `Plot ${selectedRecord.plotId}: additional CO2 ${formatNumber(selectedRecord.additionalCO2, 2)} kg | confidence ${formatNumber(selectedRecord.confidence * 100, 2)}% | final credits ${formatNumber(selectedRecord.finalCredits, 4)}`
    });
  }, [role, selectedRecord]);

  useInterval(() => {
    nudgeSensors();
  }, 4000);

  const liveClockText = `LIVE DATABASE MODE | ${new Date().toLocaleTimeString()}`;

  const databaseInfo = useMemo(() => {
    if (!db) return null;
    return {
      farmers: db.farmers.length,
      plots: db.plots.length,
      sensorNodes: db.sensorNodes.length,
      sensorReadings: db.sensorReadings.length,
      carbonRecords: db.carbonRecords.length,
      certificationReports: db.certificationReports.length,
      schemaLines: db.schemaText.split("\n").length
    };
  }, [db]);

  return {
    isLoading,
    loadError,
    role,
    selectedPlot,
    selectedFarmer,
    inputs,
    sensors,
    farmers,
    plotOptions,
    records,
    selectedRecord,
    summary,
    nutrientDisplay,
    trendData,
    additionalityData,
    farmerPerformanceData,
    certificationData,
    calcCards,
    heatmapData,
    chartOptions,
    pieOptions,
    eligibilityState,
    liveClockText,
    databaseInfo,
    onRoleChange,
    onPlotChange,
    onFarmerChange: setSelectedFarmer,
    onInputChange,
    nudgeSensors,
    runCertification
  };
}
