import { useState } from "react";
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
import { AuthPanel } from "./components/AuthPanel";
import { FarmerManagementSection } from "./components/FarmerManagementSection";
import { FarmerDetailsModal } from "./components/FarmerDetailsModal";
import { HeroHeader } from "./components/HeroHeader";
import { Sidebar } from "./components/Sidebar";
import { SummaryCards } from "./components/SummaryCards";
import { Toolbar } from "./components/Toolbar";
import { PipelineSection } from "./components/PipelineSection";
import { HeatmapSection } from "./components/HeatmapSection";
import { TraceabilityTable } from "./components/TraceabilityTable";
import { NutrientSection } from "./components/NutrientSection";
import { SqlQueryViewerPanel } from "./components/SqlQueryViewerPanel";
import { useDashboardData } from "./hooks/useDashboardData";
import { exportRecordsCsv } from "./services/exportService";
import { exportCertificationPdf } from "./services/pdfExportService";

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
    farmers,
    farmerSearch,
    activeFarmer,
    activeFarmerPlots,
    activeFarmerRecords,
    activeFarmerAccount,
    getFarmerProfile,
    newFarmerForm,
    authHints,
    login,
    logout,
    onPlotChange,
    onFarmerChange,
    onInputChange,
    onFarmerSearchChange,
    onSelectAdminFarmer,
    onNewFarmerInputChange,
    createFarmer,
    updateFarmer,
    nudgeSensors,
    runCertification
  } = useDashboardData();

  const [modalFarmerId, setModalFarmerId] = useState(null);

  if (!user) {
    return <AuthPanel authHints={authHints} onLogin={login} />;
  }

  const isAdmin = role === "admin";
  const isFarmer = role === "farmer";
  const modalProfile = modalFarmerId ? getFarmerProfile(modalFarmerId) : null;

  return (
    <div className="dashboard">
      <HeroHeader user={user} liveClockText={liveClockText} />
      {isAdmin ? <FarmerDetailsModal profile={modalProfile} onClose={() => setModalFarmerId(null)} /> : null}

      <Toolbar
        user={user}
        selectedPlot={selectedPlot}
        selectedFarmerId={selectedFarmerId}
        farmerOptions={farmerOptions}
        plotOptions={plotOptions}
        inputs={inputs}
        onPlotChange={onPlotChange}
        onFarmerChange={onFarmerChange}
        onInputChange={onInputChange}
        onNudgeSensors={nudgeSensors}
        onExport={() => exportRecordsCsv(records)}
        onExportPdf={() => exportCertificationPdf({
          selectedRecord,
          records,
          summary,
          role,
          pricePerCredit: inputs.pricePerCredit
        })}
        onLogout={logout}
      />

      {isAdmin ? (
        <div className="admin-shell">
          <Sidebar />

          <div className="admin-content">
            <section id="admin-database" className="section reveal" style={{ animationDelay: "0.08s" }}>
              <div className="section-header">
                <div>
                  <h2>Database Integration</h2>
                  <p>Seed data still loads from SQL schema and CSV tables, but access is now controlled inside the app.</p>
                </div>
              </div>
              {isLoading && <p className="metric-sub">Loading database files...</p>}
              {!isLoading && loadError && <p className="metric-sub" style={{ color: "var(--danger)" }}>{loadError}</p>}
              {!isLoading && !loadError && databaseInfo && (
                <div className="cards info-cards">
                  <div className="card"><h3>Farmers</h3><div className="metric">{databaseInfo.farmers}</div></div>
                  <div className="card"><h3>Plots</h3><div className="metric">{databaseInfo.plots}</div></div>
                  <div className="card"><h3>Sensor Readings</h3><div className="metric">{databaseInfo.sensorReadings}</div></div>
                  <div className="card"><h3>SQL Schema Lines</h3><div className="metric">{databaseInfo.schemaLines}</div></div>
                </div>
              )}
            </section>

            <div id="admin-farmers">
              <FarmerManagementSection
                role={role}
                farmers={farmers}
                farmerSearch={farmerSearch}
                activeFarmer={activeFarmer}
                activeFarmerPlots={activeFarmerPlots}
                activeFarmerRecords={activeFarmerRecords}
                activeFarmerAccount={activeFarmerAccount}
                newFarmerForm={newFarmerForm}
                onFarmerSearchChange={onFarmerSearchChange}
                onSelectAdminFarmer={onSelectAdminFarmer}
                onNewFarmerInputChange={onNewFarmerInputChange}
                onCreateFarmer={createFarmer}
                onUpdateFarmer={updateFarmer}
              />
            </div>

            <div id="admin-sql">
              <SqlQueryViewerPanel
                selectedPlot={selectedPlot}
                selectedFarmer={activeFarmer?.name || "All"}
              />
            </div>

            <div id="admin-summary">
              <SummaryCards summary={summary} />
            </div>

            <section id="admin-soil" className="layout">
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

            <section id="admin-performance" className="layout">
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

            <section id="admin-certification" className="layout">
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

            <section id="admin-analytics" className="layout">
              <HeatmapSection heatmapData={heatmapData} />
            </section>

            <div id="admin-traceability">
              <TraceabilityTable
                records={records}
                onRefresh={nudgeSensors}
                onViewFarmer={setModalFarmerId}
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <FarmerManagementSection
            role={role}
            farmers={farmers}
            farmerSearch={farmerSearch}
            activeFarmer={activeFarmer}
            activeFarmerPlots={activeFarmerPlots}
            activeFarmerRecords={activeFarmerRecords}
            activeFarmerAccount={activeFarmerAccount}
            newFarmerForm={newFarmerForm}
            onFarmerSearchChange={onFarmerSearchChange}
            onSelectAdminFarmer={onSelectAdminFarmer}
            onNewFarmerInputChange={onNewFarmerInputChange}
            onCreateFarmer={createFarmer}
            onUpdateFarmer={updateFarmer}
          />

          <SummaryCards summary={summary} />

          <section className="layout">
            <NutrientSection nutrientDisplay={nutrientDisplay} />
            <div className="section reveal" style={{ animationDelay: "0.27s" }}>
              <div className="section-header">
                <div>
                  <h2>Soil Trend Analysis</h2>
                  <p>Monthly trend for your selected plot.</p>
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
                  <p>Current carbon performance for your selected plot.</p>
                </div>
              </div>
              <div className="chart-wrap"><Bar data={additionalityData} options={chartOptions} /></div>
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

          <TraceabilityTable
            records={records}
            onRefresh={nudgeSensors}
            onViewFarmer={undefined}
          />
        </>
      )}
    </div>
  );
}
