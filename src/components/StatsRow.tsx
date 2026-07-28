export function StatsRow({
  total,
  critical,
  budgetActive,
  budgetTotal,
  patternActive,
  patternTotal,
  isAllActive,
  isCriticalActive,
  isBudgetActive,
  isPatternActive,
  onSelectAll,
  onToggleCritical,
  onSelectBudget,
  onSelectPattern,
}: {
  total: number;
  critical: number;
  budgetActive: number;
  budgetTotal: number;
  patternActive: number;
  patternTotal: number;
  isAllActive: boolean;
  isCriticalActive: boolean;
  isBudgetActive: boolean;
  isPatternActive: boolean;
  onSelectAll: () => void;
  onToggleCritical: () => void;
  onSelectBudget: () => void;
  onSelectPattern: () => void;
}) {
  return (
    <div className="stats-row">
      <div className={`stat-card${isAllActive ? ' active' : ''}`} onClick={onSelectAll} title="Show all severities">
        <div className="stat-label">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Total Anomalies
        </div>
        <div className="stat-value">{total}</div>
        <div className="stat-trend up">↑ 4 vs last 7 days</div>
      </div>

      <div
        className={`stat-card${isCriticalActive ? ' active' : ''}`}
        onClick={onToggleCritical}
        title="Filter to critical severity"
      >
        <div className="stat-label">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Critical
        </div>
        <div className="stat-value red">{critical}</div>
        <div className="stat-trend">Requires immediate action</div>
      </div>

      <div
        className={`stat-card${isBudgetActive ? ' active' : ''}`}
        onClick={onSelectBudget}
        title="Show Budget-Based anomalies"
      >
        <div className="stat-label">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Budget Breaches
        </div>
        <div className="stat-value orange">{budgetActive}</div>
        <div className="stat-trend">{budgetTotal} total this month</div>
      </div>

      <div
        className={`stat-card${isPatternActive ? ' active' : ''}`}
        onClick={onSelectPattern}
        title="Show Pattern-Based anomalies"
      >
        <div className="stat-label">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Pattern Spikes
        </div>
        <div className="stat-value purple">{patternActive}</div>
        <div className="stat-trend">{patternTotal} detected in 30d window</div>
      </div>
    </div>
  );
}
