import { useMemo } from 'react';
import type { PatternAnomaly, Severity } from '../types';
import { SEV_RANK, TIMELINE_DOW } from '../data/anomalies';
import { eur } from '../utils/format';
import { computeSeasonalIQRBoundsAt, getOutlierDirection, WEEKDAY_NAMES } from '../utils/iqr';
import type { Column } from '../utils/sort';
import { sortRows } from '../utils/sort';
import { sparkData, SPARK_HISTORY_DAYS } from '../utils/sparkline';
import { useSortState } from '../hooks/useSortState';
import { SortableThead } from './SortableThead';
import { DetectedCell, IqrBadge, ProviderLabel, SaveButton, SeverityBadge, ServiceCell, Sparkline } from './TableBits';

const COLUMNS: Column<PatternAnomaly>[] = [
  { key: null, label: '' },
  { key: 'svc', label: 'Service', getValue: (a) => a.svc },
  { key: 'acct', label: 'Account / Project', getValue: (a) => a.acct },
  { key: 'prov', label: 'Provider', getValue: (a) => a.prov },
  { key: 'base', label: 'Baseline', getValue: (a) => a.base },
  { key: 'spike', label: 'Spike Cost', getValue: (a) => a.spike },
  { key: 'dev', label: 'Deviation', getValue: (a) => a.dev },
  { key: null, label: 'Trend (6mo)' },
  { key: 'sev', label: 'Severity', getValue: (a) => SEV_RANK[a.sev] },
  { key: 'ago', label: 'Detected', getValue: (a) => a.ago },
  { key: null, label: 'Action' },
];

const SPARK_COLOR: Record<Severity, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#f59e0b',
};

function PatternRow({
  anomaly,
  isSaved,
  onToggleSave,
  onResolve,
}: {
  anomaly: PatternAnomaly;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  const spikeMult = anomaly.spike / anomaly.base;
  const spikeIdx = SPARK_HISTORY_DAYS - 1 - anomaly.ago;
  const { weeklyBumpDow, weeklyBumpAmount } = anomaly;
  const series = useMemo(() => {
    const weeklyBump = weeklyBumpDow !== undefined ? { [weeklyBumpDow]: weeklyBumpAmount ?? 0 } : undefined;
    return sparkData(anomaly.base, spikeMult, anomaly.ago, anomaly.seed, { dow: TIMELINE_DOW, weeklyBump });
  }, [anomaly.base, spikeMult, anomaly.ago, anomaly.seed, weeklyBumpDow, weeklyBumpAmount]);
  // Seasonal, leave-one-out: bounds come from this row's OTHER same-weekday days (up to 6 months of
  // history), excluding the spike day itself — so a routine weekly pattern (e.g. a Monday batch job)
  // reads as normal, while the same magnitude on an off-day still stands out.
  const weekday = WEEKDAY_NAMES[TIMELINE_DOW[spikeIdx]];
  const bounds = useMemo(() => computeSeasonalIQRBoundsAt(series, TIMELINE_DOW, spikeIdx), [series, spikeIdx]);
  const isOutlier = getOutlierDirection(series[spikeIdx], bounds) === 'high';

  return (
    <tr>
      <td className="save-cell">
        <SaveButton saved={isSaved} onClick={() => onToggleSave(anomaly.id)} />
      </td>
      <td>
        <ServiceCell variant="pattern" svc={anomaly.svc} region={anomaly.region} />
      </td>
      <td style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{anomaly.acct}</td>
      <td>
        <ProviderLabel prov={anomaly.prov} />
      </td>
      <td style={{ color: 'var(--text-dim)', fontSize: '1rem', whiteSpace: 'nowrap' }}>{eur(anomaly.base)}/day</td>
      <td>
        <div className="cost-main over" style={{ fontSize: '1.09rem' }}>
          {eur(anomaly.spike)}/day
        </div>
      </td>
      <td>
        <span className={`dev-badge ${anomaly.sev}`}>+{anomaly.dev}%</span>
      </td>
      <td>
        <div className="spark-cell">
          <Sparkline data={series} spikeIdx={spikeIdx} color={SPARK_COLOR[anomaly.sev]} bounds={bounds} isOutlier={isOutlier} weekday={weekday} />
          <IqrBadge isOutlier={isOutlier} bounds={bounds} weekday={weekday} />
        </div>
      </td>
      <td>
        <SeverityBadge sev={anomaly.sev} />
      </td>
      <td>
        <DetectedCell ago={anomaly.ago} />
      </td>
      <td>
        {anomaly.stat !== 'resolved' ? (
          <button className="action-btn resolve" onClick={() => onResolve(anomaly.id)}>
            Resolve
          </button>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>—</span>
        )}
      </td>
    </tr>
  );
}

export function PatternTable({
  rows,
  isSaved,
  onToggleSave,
  onResolve,
}: {
  rows: PatternAnomaly[];
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  const [sortState, onSort] = useSortState();
  const sorted = useMemo(() => sortRows(rows, sortState, COLUMNS), [rows, sortState]);

  return (
    <div className="table-wrap">
      <table>
        <SortableThead columns={COLUMNS} sortState={sortState} onSort={onSort} />
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} style={{ textAlign: 'center', padding: '3.27rem', color: 'var(--text-muted)' }}>
                No anomalies match your filters
              </td>
            </tr>
          ) : (
            sorted.map((a) => (
              <PatternRow key={a.id} anomaly={a} isSaved={isSaved(a.id)} onToggleSave={onToggleSave} onResolve={onResolve} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
