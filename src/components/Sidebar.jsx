const adminNavItems = [
  { id: "admin-database", label: "Database" },
  { id: "admin-farmers", label: "Farmers" },
  { id: "admin-sql", label: "SQL Viewer" },
  { id: "admin-summary", label: "Summary" },
  { id: "admin-soil", label: "Soil Analysis" },
  { id: "admin-performance", label: "Performance" },
  { id: "admin-certification", label: "Certification" },
  { id: "admin-analytics", label: "Analytics" },
  { id: "admin-traceability", label: "Traceability" }
];

export function Sidebar() {
  return (
    <aside className="sidebar reveal">
      <div className="sidebar-header">
        <h3>Admin Portal</h3>
        <p>Quick navigation across the control surfaces.</p>
      </div>

      <nav className="sidebar-nav" aria-label="Admin portal sections">
        {adminNavItems.map((item) => (
          <a key={item.id} className="nav-item" href={`#${item.id}`}>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
