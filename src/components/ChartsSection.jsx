import { Bar, Line, Pie } from "react-chartjs-2";

export function ChartsSection({
  trendData,
  additionalityData,
  farmerPerformanceData,
  certificationData,
  chartOptions,
  pieOptions
}) {
  return (
    <>
      <section className="layout">
        <div className="section reveal" style={{ animationDelay: "0.27s" }}>
          <div className="section-header">
            <div>
              <h2>Soil Trend Analysis</h2>
              <p>Monthly SOC trend versus threshold for certification review.</p>
            </div>
          </div>
          <div className="chart-wrap tall"><Line data={trendData} options={chartOptions} /></div>
        </div>

        <div className="section reveal" style={{ animationDelay: "0.3s" }}>
          <div className="section-header">
            <div>
              <h2>Additionality Visualization</h2>
              <p>Current CO2 equivalent compared with dynamic baseline CO2.</p>
            </div>
          </div>
          <div className="chart-wrap"><Bar data={additionalityData} options={chartOptions} /></div>
        </div>
      </section>

      <section className="layout">
        <div className="section reveal" style={{ animationDelay: "0.33s" }}>
          <div className="section-header">
            <div>
              <h2>Farmer Performance</h2>
              <p>Credits generated per farmer for comparative analysis.</p>
            </div>
          </div>
          <div className="chart-wrap"><Bar data={farmerPerformanceData} options={chartOptions} /></div>
        </div>

        <div className="section reveal" style={{ animationDelay: "0.36s" }}>
          <div className="section-header">
            <div>
              <h2>Certification Status</h2>
              <p>Eligible vs non-eligible plots based on additionality and confidence.</p>
            </div>
          </div>
          <div className="chart-wrap"><Pie data={certificationData} options={pieOptions} /></div>
        </div>
      </section>
    </>
  );
}
