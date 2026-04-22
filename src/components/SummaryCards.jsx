import { formatNumber } from "../services/carbonService";

export function SummaryCards({ summary }) {
  const cards = [
    {
      title: "Total Carbon Credits",
      value: formatNumber(summary.totalCredits, 3),
      sub: "Gross credits before buffer deduction"
    },
    {
      title: "Final Credits",
      value: formatNumber(summary.finalCredits, 3),
      sub: "After 10% risk buffer pool adjustment"
    },
    {
      title: "Total Revenue",
      value: `Rs ${formatNumber(summary.totalRevenue, 2)}`,
      sub: "Final credits multiplied by current credit price"
    },
    {
      title: "Average SOC",
      value: `${formatNumber(summary.avgSoc, 2)}%`,
      sub: "Model-estimated average SOC across active scope"
    },
    {
      title: "Eligible Plots",
      value: `${summary.eligibleCount} / ${summary.totalCount}`,
      sub: "Plots with positive additionality and confidence > 95%"
    },
    {
      title: "Total Farmers",
      value: String(summary.farmerCount),
      sub: "Distinct farmers currently represented"
    }
  ];

  return (
    <section className="cards" aria-label="Summary cards">
      {cards.map((card, index) => (
        <div key={card.title} className="card reveal" style={{ animationDelay: `${0.1 + index * 0.02}s` }}>
          <h3>{card.title}</h3>
          <div className="metric">{card.value}</div>
          <div className="metric-sub">{card.sub}</div>
        </div>
      ))}
    </section>
  );
}
