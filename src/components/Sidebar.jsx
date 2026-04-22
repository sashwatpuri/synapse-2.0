import { useState } from "react";

export function Sidebar({ activeTab, onTabChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    {
      id: "overview",
      label: "Dashboard Overview",
      icon: "📊"
    },
    {
      id: "soil-analysis",
      label: "Soil Analysis",
      icon: "🌱"
    },
    {
      id: "performance",
      label: "Performance Analytics",
      icon: "📈"
    },
    {
      id: "pipeline",
      label: "Carbon Pipeline",
      icon: "⚙️"
    },
    {
      id: "infrastructure",
      label: "Infrastructure",
      icon: "🏗️"
    },
    {
      id: "traceability",
      label: "Traceability",
      icon: "🔗"
    },
    {
      id: "database",
      label: "Database",
      icon: "💾"
    }
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? "▶" : "◀"}
        </button>
        {!isCollapsed && <h3>Features</h3>}
      </div>

      <nav className="sidebar-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onTabChange(tab.id)}
            title={isCollapsed ? tab.label : ""}
          >
            <span className="nav-icon">{tab.icon}</span>
            {!isCollapsed && <span className="nav-label">{tab.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!isCollapsed && (
          <p className="sidebar-hint">Click tabs to navigate</p>
        )}
      </div>
    </aside>
  );
}
