import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import { HeroHeader } from "./components/HeroHeader";
import { SummaryCards } from "./components/SummaryCards";
import { Toolbar } from "./components/Toolbar";
import { PipelineSection } from "./components/PipelineSection";
import { HeatmapSection } from "./components/HeatmapSection";
import { ApiContractsSection } from "./components/ApiContractsSection";
import { TraceabilityTable } from "./components/TraceabilityTable";
import { NutrientSection } from "./components/NutrientSection";
import { useDashboardData } from "./hooks/useDashboardData";
import { exportRecordsCsv } from "./services/exportService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export default function App() {
  const {
    isLoading,
    loadError,
    role,
    selectedPlot,
    selectedFarmer,
    inputs,
    farmers,
    plotOptions,
    records,
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
    onFarmerChange,
    onInputChange,
    nudgeSensors,
    runCertification
  } = useDashboardData();

  return (
    <div className="dashboard">
      <HeroHeader role={role} liveClockText={liveClockText} />

      <Toolbar
        role={role}
        selectedPlot={selectedPlot}
        selectedFarmer={selectedFarmer}
        farmers={farmers}
        plotOptions={plotOptions}
        inputs={inputs}
        onRoleChange={onRoleChange}
        onPlotChange={onPlotChange}
        onFarmerChange={onFarmerChange}
        onInputChange={onInputChange}
        onNudgeSensors={nudgeSensors}
        onExport={() => exportRecordsCsv(records)}
      />

      <section className="section reveal" style={{ animationDelay: "0.08s" }}>
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

      <SummaryCards summary={summary} />

      <section className="layout">
        <NutrientSection nutrientDisplay={nutrientDisplay} />
        <div className="section reveal" style={{ animationDelay: "0.27s" }}>
          <div className="section-header">
            <div>
              <h2>Soil Trend Analysis</h2>
              <p>Monthly SOC trend versus threshold for certification review.</p>
            </div>
          </div>
          <div className="chart-wrap tall"><Line data={trendData} options={chartOptions} /></div>
        </div>
      </section>

      <section className="layout">
        <div className="section reveal" style={{ animationDelay: "0.30s" }}>
          <div className="section-header">
            <div>
              <h2>Additionality Visualization</h2>
              <p>Current CO2 equivalent compared with dynamic baseline CO2.</p>
            </div>
          </div>
          <div className="chart-wrap"><Bar data={additionalityData} options={chartOptions} /></div>
        </div>

        <div className="section reveal" style={{ animationDelay: "0.33s" }}>
          <div className="section-header">
            <div>
              <h2>Farmer Performance</h2>
              <p>Credits generated per farmer for comparative analysis.</p>
            </div>
          </div>
          <div className="chart-wrap"><Bar data={farmerPerformanceData} options={chartOptions} /></div>
        </div>
      </section>

      <section className="layout">
        <div className="section reveal" style={{ animationDelay: "0.36s" }}>
          <div className="section-header">
            <div>
              <h2>Certification Status</h2>
              <p>Eligible vs non-eligible plots based on additionality and confidence.</p>
            </div>
          </div>
          <div className="chart-wrap"><Pie data={certificationData} options={pieOptions} /></div>
        </div>

        <PipelineSection
          role={role}
          inputs={inputs}
          onInputChange={onInputChange}
          calcCards={calcCards}
          eligibilityState={eligibilityState}
          onRunCertification={runCertification}
        />
      </section>

      <section className="layout">
        <HeatmapSection heatmapData={heatmapData} />
        <ApiContractsSection />
      </section>

      <TraceabilityTable records={records} onRefresh={nudgeSensors} />
    </div>
  );
}
