import { ApiContractsSection } from "./ApiContractsSection";
import { ChartsSection } from "./ChartsSection";
import { HeatmapSection } from "./HeatmapSection";
import { NutrientSection } from "./NutrientSection";
import { PipelineSection } from "./PipelineSection";

export function DashboardLayout({
  nutrientDisplay,
  trendData,
  additionalityData,
  farmerPerformanceData,
  certificationData,
  chartOptions,
  pieOptions,
  role,
  inputs,
  onInputChange,
  calcCards,
  eligibilityState,
  onRunCertification,
  heatmapData
}) {
  return (
    <>
      <section className="layout">
        <NutrientSection nutrientDisplay={nutrientDisplay} />
        <ChartsSection
          trendData={trendData}
          additionalityData={additionalityData}
          farmerPerformanceData={farmerPerformanceData}
          certificationData={certificationData}
          chartOptions={chartOptions}
          pieOptions={pieOptions}
        />
      </section>

      <section className="layout">
        <PipelineSection
          role={role}
          inputs={inputs}
          onInputChange={onInputChange}
          calcCards={calcCards}
          eligibilityState={eligibilityState}
          onRunCertification={onRunCertification}
        />
      </section>

      <section className="layout">
        <HeatmapSection heatmapData={heatmapData} />
        <ApiContractsSection />
      </section>
    </>
  );
}
