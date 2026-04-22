export function HeroHeader({ role, liveClockText }) {
  return (
    <header className="hero reveal">
      <div className="title-block">
        <h1>Soil Carbon Intelligence Dashboard</h1>
        <p>
          Role-aware dashboard for SOC prediction, carbon estimation, baseline additionality checks,
          Verra-style eligibility, and credit revenue monitoring.
        </p>
      </div>
      <div className="hero-meta">
        <span className="pill role">
          {role === "admin" ? "ROLE: Admin / Certifying Authority" : "ROLE: Data Analyst (Read-only + Analytics)"}
        </span>
        <span className="pill live">{liveClockText}</span>
      </div>
    </header>
  );
}
