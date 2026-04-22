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
import {
  clearSession,
  createFarmerAccount,
  ensureAccounts,
  buildNextAppState,
  loadAppState,
  loadSession,
  mergeCertificates,
  mergeFarmers,
  saveAppState,
  saveSession,
  upsertFarmerState,
  buildNextFarmer
} from "../services/appStateService";
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

const emptyFarmerForm = {
  name: "",
  contact: "",
  pincode: "",
  registration_no: "",
  village: "",
  notes: "",
  status: "PENDING"
};

export function useDashboardData() {
  const [db, setDb] = useState(null);
  const [seedFarmers, setSeedFarmers] = useState([]);
  const [farmersState, setFarmersState] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [session, setSession] = useState(loadSession());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedPlot, setSelectedPlot] = useState("");
  const [selectedFarmerId, setSelectedFarmerId] = useState("ALL");
  const [selectedAdminFarmerId, setSelectedAdminFarmerId] = useState("");
  const [farmerSearch, setFarmerSearch] = useState("");
  const [newFarmerForm, setNewFarmerForm] = useState(emptyFarmerForm);
  const [inputs, setInputs] = useState(initialInputs);
  const [sensors, setSensors] = useState(initialSensors);
  const [appStateVersion, setAppStateVersion] = useState(0);
  const [eligibilityState, setEligibilityState] = useState({
    label: "PENDING REVIEW",
    className: "amber",
    details: "Admin can trigger certification workflow. Farmer accounts can review only their own traceability data."
  });

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const assets = await loadDatabaseAssets();
        if (!active) return;

        const appState = loadAppState();
        const mergedFarmers = mergeFarmers(assets.farmers, appState);
        const accountState = ensureAccounts(mergedFarmers, appState);

        setDb({ ...assets, farmers: mergedFarmers });
        setSeedFarmers(assets.farmers);
        setFarmersState(mergedFarmers);
        setAccounts(accountState);

        const firstPlot = assets.plots[0];
        if (firstPlot) {
          setSelectedPlot(String(firstPlot.plot_id));
          setInputs((prev) => ({
            ...prev,
            area: firstPlot.area_hectare,
            bulkDensity: firstPlot.bulk_density_g_per_cm3
          }));
        }

        if (!selectedAdminFarmerId && mergedFarmers[0]) {
          setSelectedAdminFarmerId(String(mergedFarmers[0].farmer_id));
        }

        saveAppState({
          ...upsertFarmerState(mergedFarmers, accountState),
          certificateOverrides: appState.certificateOverrides || {}
        });
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
  }, [selectedAdminFarmerId]);

  useEffect(() => {
    if (!farmersState.length || !accounts.length || !db) return;
    const currentState = loadAppState();
    const mergedRecords = mergeCertificates(
      db.certificationReports.map((report) => ({ reportId: report.report_id })),
      currentState
    );
    saveAppState(buildNextAppState({ farmers: farmersState, accounts, certificates: mergedRecords }));
  }, [accounts, db, farmersState]);

  const user = useMemo(() => {
    if (!session) return null;
    return accounts.find((account) => account.username === session.username && account.role === session.role) || null;
  }, [accounts, session]);

  const role = user?.role || "guest";

  const farmerById = useMemo(
    () => new Map(farmersState.map((farmer) => [farmer.farmer_id, farmer])),
    [farmersState]
  );

  const plotById = useMemo(() => {
    if (!db) return new Map();
    return new Map(db.plots.map((plot) => [plot.plot_id, plot]));
  }, [db]);

  const soilById = useMemo(() => {
    if (!db) return new Map();
    return new Map(db.soilTypes.map((soil) => [soil.soil_type_id, soil]));
  }, [db]);

  const visibleFarmerIds = useMemo(() => {
    if (role === "farmer" && user?.farmer_id) return [user.farmer_id];
    return farmersState.map((farmer) => farmer.farmer_id);
  }, [farmersState, role, user]);

  const visibleFarmers = useMemo(
    () => farmersState.filter((farmer) => visibleFarmerIds.includes(farmer.farmer_id)),
    [farmersState, visibleFarmerIds]
  );

  const filteredFarmers = useMemo(() => {
    if (role !== "admin") return visibleFarmers;
    const query = farmerSearch.trim().toLowerCase();
    if (!query) return visibleFarmers;

    return visibleFarmers.filter((farmer) => (
      farmer.name.toLowerCase().includes(query) ||
      farmer.public_farmer_uid.toLowerCase().includes(query) ||
      String(farmer.contact).includes(query) ||
      String(farmer.registration_no).toLowerCase().includes(query)
    ));
  }, [farmerSearch, role, visibleFarmers]);

  const effectiveFarmerFilter = role === "farmer"
    ? String(user?.farmer_id || "")
    : selectedFarmerId;

  const filteredPlots = useMemo(() => {
    if (!db) return [];
    if (effectiveFarmerFilter === "ALL" || !effectiveFarmerFilter) {
      return db.plots.filter((plot) => visibleFarmerIds.includes(plot.farmer_id));
    }

    return db.plots.filter((plot) => String(plot.farmer_id) === String(effectiveFarmerFilter));
  }, [db, effectiveFarmerFilter, visibleFarmerIds]);

  useEffect(() => {
    if (!filteredPlots.length) {
      setSelectedPlot("");
      return;
    }

    const isValid = filteredPlots.some((plot) => String(plot.plot_id) === selectedPlot);
    if (!isValid) {
      const nextPlot = filteredPlots[0];
      setSelectedPlot(String(nextPlot.plot_id));
      setInputs((prev) => ({
        ...prev,
        area: nextPlot.area_hectare,
        bulkDensity: nextPlot.bulk_density_g_per_cm3
      }));
    }
  }, [filteredPlots, selectedPlot]);

  useEffect(() => {
    if (role === "admin" && !selectedAdminFarmerId && farmersState[0]) {
      setSelectedAdminFarmerId(String(farmersState[0].farmer_id));
    }

    if (role === "farmer" && user?.farmer_id) {
      setSelectedAdminFarmerId(String(user.farmer_id));
      setSelectedFarmerId(String(user.farmer_id));
    }
  }, [farmersState, role, selectedAdminFarmerId, user]);

  const records = useMemo(() => {
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

    const baseRecords = db.certificationReports
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
          farmerId: farmer?.farmer_id || null,
          publicFarmerId: farmer?.public_farmer_uid || "-",
          farmerStatus: farmer?.status || "ACTIVE",
          contact: farmer?.contact || "-",
          registrationNo: farmer?.registration_no || "-",
          plotId: String(report.land_id),
          plotLocation: plot?.location || "-",
          soilType: soilById.get(plot?.soil_type)?.type_name || "-",
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

    const appState = loadAppState();
    return mergeCertificates(baseRecords, appState);
  }, [appStateVersion, db, farmerById, filteredPlots, inputs.depth, inputs.pricePerCredit, plotById, soilById]);

  const selectedRecord = useMemo(
    () => records.find((record) => record.plotId === selectedPlot) || records[0] || null,
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

  const trendData = useMemo(() => {
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
  }, [db, selectedPlot, selectedRecord]);

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
      { label: "Revenue (Rs)", value: formatNumber(selectedRecord.revenue, 2) }
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
    if (!eligible) {
      setEligibilityState({
        label: "ISSUANCE BLOCKED",
        className: "red",
        details: `Plot ${selectedRecord.plotId}: certificate cannot be issued because the selected record is not eligible.`
      });
      return;
    }
    const issuedOn = new Date();
    const validUntil = new Date(issuedOn);
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    const nextRecords = records.map((record) => (
      record.reportId === selectedRecord.reportId
        ? {
            ...record,
            certificateStatus: "ISSUED",
            certificateIssuedOn: issuedOn.toISOString().slice(0, 10),
            certificateValidUntil: validUntil.toISOString().slice(0, 10),
            approvalNotes: "Approved for issuance after eligibility review."
          }
        : record
    ));
    saveAppState(buildNextAppState({ farmers: farmersState, accounts, certificates: nextRecords }));
    setAppStateVersion((value) => value + 1);

    setEligibilityState({
      label: "CERTIFICATE ISSUED",
      className: "green",
      details: `Plot ${selectedRecord.plotId}: certificate issued | final credits ${formatNumber(selectedRecord.finalCredits, 4)} | verification ${selectedRecord.verificationCode}`
    });
  }, [accounts, farmersState, records, role, selectedRecord]);

  const login = useCallback((username, password) => {
    const matched = accounts.find((account) => account.username === username && account.password === password);
    if (!matched) {
      return { ok: false, message: "Invalid username or password" };
    }

    const nextSession = {
      username: matched.username,
      role: matched.role,
      farmer_id: matched.farmer_id || null
    };

    setSession(nextSession);
    saveSession(nextSession);

    if (matched.role === "farmer" && matched.farmer_id) {
      setSelectedFarmerId(String(matched.farmer_id));
      setSelectedAdminFarmerId(String(matched.farmer_id));
    } else {
      setSelectedFarmerId("ALL");
    }

    return { ok: true };
  }, [accounts]);

  const logout = useCallback(() => {
    setSession(null);
    clearSession();
  }, []);

  const onNewFarmerInputChange = useCallback((key, value) => {
    setNewFarmerForm((prev) => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const createFarmer = useCallback(() => {
    if (role !== "admin") {
      return { ok: false, message: "Only admin can create farmer records" };
    }

    const required = ["name", "contact", "pincode"];
    const missing = required.find((field) => !newFarmerForm[field].trim());
    if (missing) {
      return { ok: false, message: `Missing ${missing}` };
    }

    const nextFarmer = buildNextFarmer(farmersState.length ? farmersState : seedFarmers, newFarmerForm);
    const nextAccount = createFarmerAccount(nextFarmer);

    setFarmersState((prev) => [...prev, nextFarmer]);
    setAccounts((prev) => [...prev, nextAccount]);
    setSelectedAdminFarmerId(String(nextFarmer.farmer_id));
    setNewFarmerForm(emptyFarmerForm);

    return {
      ok: true,
      credentials: {
        username: nextAccount.username,
        password: nextAccount.password
      }
    };
  }, [farmersState, newFarmerForm, role, seedFarmers]);

  const updateFarmer = useCallback((farmerId, updates) => {
    if (role !== "admin") return;

    setFarmersState((prev) => prev.map((farmer) => (
      farmer.farmer_id === farmerId
        ? { ...farmer, ...updates, updated_at: new Date().toISOString() }
        : farmer
    )));
  }, [role]);

  const activeFarmer = useMemo(() => {
    const fallbackId = role === "farmer" ? user?.farmer_id : Number(selectedAdminFarmerId);
    return farmerById.get(Number(fallbackId)) || null;
  }, [farmerById, role, selectedAdminFarmerId, user]);

  const activeFarmerPlots = useMemo(() => {
    if (!db || !activeFarmer) return [];
    return db.plots
      .filter((plot) => plot.farmer_id === activeFarmer.farmer_id)
      .map((plot) => ({
        ...plot,
        soilTypeName: soilById.get(plot.soil_type)?.type_name || "-"
      }));
  }, [activeFarmer, db, soilById]);

  const activeFarmerRecords = useMemo(() => {
    if (!activeFarmer) return [];
    return records.filter((record) => record.farmerId === activeFarmer.farmer_id);
  }, [activeFarmer, records]);

  const activeFarmerAccount = useMemo(() => {
    if (!activeFarmer) return null;
    return accounts.find((account) => account.role === "farmer" && account.farmer_id === activeFarmer.farmer_id) || null;
  }, [accounts, activeFarmer]);

  const getFarmerProfile = useCallback((farmerId) => {
    const farmer = farmerById.get(Number(farmerId));
    if (!farmer || !db) return null;

    const plots = db.plots
      .filter((plot) => plot.farmer_id === farmer.farmer_id)
      .map((plot) => ({
        ...plot,
        soilTypeName: soilById.get(plot.soil_type)?.type_name || "-"
      }));

    const farmerRecords = records.filter((record) => record.farmerId === farmer.farmer_id);
    const account = accounts.find((item) => item.role === "farmer" && item.farmer_id === farmer.farmer_id) || null;

    return {
      farmer,
      plots,
      records: farmerRecords,
      account
    };
  }, [accounts, db, farmerById, records, soilById]);

  const updateCertificate = useCallback((reportId, updates) => {
    if (role !== "admin") return;
    const targetRecord = records.find((record) => record.reportId === reportId);
    if (!targetRecord) return;
    if (updates.certificateStatus === "ISSUED" && !targetRecord.isEligible) {
      setEligibilityState({
        label: "ISSUANCE BLOCKED",
        className: "red",
        details: `Certificate ${targetRecord.certificateId} cannot move to ISSUED because the record is not eligible.`
      });
      return;
    }
    const nextRecords = records.map((record) => (
      record.reportId === reportId ? { ...record, ...updates } : record
    ));
    saveAppState(buildNextAppState({ farmers: farmersState, accounts, certificates: nextRecords }));
    setAppStateVersion((value) => value + 1);
    if (selectedRecord?.reportId === reportId) {
      setEligibilityState({
        label: updates.certificateStatus || selectedRecord.certificateStatus,
        className: updates.certificateStatus === "ISSUED" ? "green" : "amber",
        details: `Certificate ${updates.certificateId || selectedRecord.certificateId} updated for plot ${selectedRecord.plotId}.`
      });
    }
  }, [accounts, farmersState, records, role, selectedRecord]);

  const farmerOptions = useMemo(() => {
    if (role === "farmer") {
      return visibleFarmers.map((farmer) => ({
        id: String(farmer.farmer_id),
        label: `${farmer.name} (${farmer.public_farmer_uid})`
      }));
    }

    return [
      { id: "ALL", label: "All Farmers" },
      ...visibleFarmers.map((farmer) => ({
        id: String(farmer.farmer_id),
        label: `${farmer.name} (${farmer.public_farmer_uid})`
      }))
    ];
  }, [role, visibleFarmers]);

  const plotOptions = useMemo(() => filteredPlots.map((plot) => ({
    id: String(plot.plot_id),
    label: `Plot ${plot.plot_id} - ${plot.location}`
  })), [filteredPlots]);

  useInterval(() => {
    if (role !== "guest") {
      nudgeSensors();
    }
  }, 4000);

  const liveClockText = `LIVE DATABASE MODE | ${new Date().toLocaleTimeString()}`;

  const databaseInfo = useMemo(() => {
    if (!db) return null;
    return {
      farmers: farmersState.length,
      plots: db.plots.length,
      sensorNodes: db.sensorNodes.length,
      sensorReadings: db.sensorReadings.length,
      carbonRecords: db.carbonRecords.length,
      certificationReports: db.certificationReports.length,
      schemaLines: db.schemaText.split("\n").length
    };
  }, [db, farmersState.length]);

  const authHints = useMemo(() => {
    const firstFarmerAccount = accounts.find((account) => account.role === "farmer");
    return {
      admin: { username: "admin_user", password: "admin123" },
      farmer: firstFarmerAccount
        ? {
            username: firstFarmerAccount.username,
            password: firstFarmerAccount.password
          }
        : null
    };
  }, [accounts]);

  return {
    isLoading,
    loadError,
    role,
    user,
    selectedPlot,
    selectedFarmerId,
    inputs,
    farmerOptions,
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
    farmers: filteredFarmers,
    farmerSearch,
    activeFarmer,
    activeFarmerPlots,
    activeFarmerRecords,
    activeFarmerAccount,
    getFarmerProfile,
    updateCertificate,
    newFarmerForm,
    authHints,
    login,
    logout,
    onPlotChange,
    onFarmerChange: setSelectedFarmerId,
    onInputChange,
    onFarmerSearchChange: setFarmerSearch,
    onSelectAdminFarmer: setSelectedAdminFarmerId,
    onNewFarmerInputChange,
    createFarmer,
    updateFarmer,
    nudgeSensors,
    runCertification
  };
}
