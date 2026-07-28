import { useMemo } from 'react';
import type { PatternAnomaly, Severity } from '../types';
import { SEV_RANK } from '../data/anomalies';
import { eur } from '../utils/format';
import type { Column } from '../utils/sort';
import { sortRows } from '../utils/sort';
import { useSortState } from '../hooks/useSortState';
import { SortableThead } from './SortableThead';
import { DetectedCell, ProviderLabel, SaveButton, SeverityBadge, ServiceCell, Sparkline } from './TableBits';

const COLUMNS: Column<PatternAnomaly>[] = [
  { key: null, label: '' },
  { key: 'svc', label: 'Service', getValue: (a) => a.svc },
  { key: 'acct', label: 'Account / Project', getValue: (a) => a.acct },
  { key: 'prov', label: 'Provider', getValue: (a) => a.prov },
  { key: 'base', label: '30d Baseline', getValue: (a) => a.base },
  { key: 'spike', label: 'Spike Cost', getValue: (a) => a.spike },
  { key: 'dev', label: 'Deviation', getValue: (a) => a.dev },
  { key: null, label: 'Trend (30d)' },
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
          <Sparkline base={anomaly.base} spikeMult={spikeMult} spikeDayFromEnd={anomaly.ago} seed={anomaly.seed} color={SPARK_COLOR[anomaly.sev]} />
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
