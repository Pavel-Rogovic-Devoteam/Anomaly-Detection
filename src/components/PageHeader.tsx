import type { PeriodOption } from '../types';
import { PeriodSelector } from './PeriodSelector';

export function PageHeader({
  period,
  onChangePeriod,
}: {
  period: PeriodOption;
  onChangePeriod: (period: PeriodOption) => void;
}) {
  return (
    <div className="page-header">
      <div>
        <h2 className="page-title">Anomaly Detection</h2>
        <p className="page-subtitle">Budget breaches and pattern-based cost spikes · last 30 days</p>
      </div>
      <div className="page-actions">
        <PeriodSelector period={period} onChangePeriod={onChangePeriod} />
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
