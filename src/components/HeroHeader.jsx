export function HeroHeader({ user, liveClockText }) {
  const role = user?.role || "guest";
  const title = role === "admin"
    ? "Admin Control Center"
    : role === "farmer"
      ? "Farmer Self-Service Dashboard"
      : "Secure Soil Carbon Access";

  return (
    <header className="hero reveal">
      <div className="title-block">
        <h1>{title}</h1>
        <p>
          Role-aware dashboard for SOC prediction, carbon estimation, farmer identity management,
          and controlled access to traceability and certification data.
        </p>
      </div>
      <div className="hero-meta">
        <span className="pill role">
          {role === "admin"
            ? `ROLE: Admin | ${user.username}`
            : role === "farmer"
              ? `ROLE: Farmer | ${user.username}`
              : "ROLE: Guest"}
        </span>
        <span className="pill live">{liveClockText}</span>
      </div>
    </header>
  );
}
