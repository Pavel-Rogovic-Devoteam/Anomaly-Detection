export function PageHeader() {
  return (
    <div className="page-header">
      <div>
        <h2 className="page-title">Anomaly Detection</h2>
        <p className="page-subtitle">Budget breaches and pattern-based cost spikes · last 30 days</p>
      </div>
      <div className="page-actions">
        <button className="page-btn">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          May 2026
        </button>
        <button className="page-btn accent">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Configure Alerts
        </button>
      </div>
    </div>
  );
}
