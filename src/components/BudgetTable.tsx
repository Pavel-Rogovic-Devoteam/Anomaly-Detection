import { useMemo } from 'react';
import type { BudgetAnomaly } from '../types';
import { SEV_RANK } from '../data/anomalies';
import { eur } from '../utils/format';
import type { Column } from '../utils/sort';
import { sortRows } from '../utils/sort';
import { useSortState } from '../hooks/useSortState';
import { SortableThead } from './SortableThead';
import { AlertPill, DetectedCell, ProviderLabel, SaveButton, SeverityBadge, ServiceCell } from './TableBits';

const COLUMNS: Column<BudgetAnomaly>[] = [
  { key: null, label: '' },
  { key: 'svc', label: 'Budget Name', getValue: (a) => a.svc },
  { key: 'acct', label: 'Subscription Name', getValue: (a) => a.acct },
  { key: 'prov', label: 'Provider', getValue: (a) => a.prov },
  { key: 'cur', label: 'Current Cost', getValue: (a) => a.cur },
  { key: 'bud', label: 'Budget', getValue: (a) => a.bud },
  { key: 'health', label: 'Health Status', getValue: (a) => a.cur / a.bud },
  { key: 'alert', label: 'Alert State', getValue: (a) => a.cur / a.bud },
  { key: 'sev', label: 'Severity', getValue: (a) => SEV_RANK[a.sev] },
  { key: 'ago', label: 'Detected', getValue: (a) => a.ago },
  { key: null, label: 'Action' },
];

function BudgetRow({
  anomaly,
  isSaved,
  onToggleSave,
  onResolve,
}: {
  anomaly: BudgetAnomaly;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  const pct = (anomaly.cur / anomaly.bud) * 100;
  const overage = anomaly.cur - anomaly.bud;
  const overPct = Math.round((overage / anomaly.bud) * 100);
  const barColor = overPct > 30 ? '#ef4444' : overPct > 10 ? '#f97316' : '#22d3ee';

  return (
    <tr>
      <td className="save-cell">
        <SaveButton saved={isSaved} onClick={() => onToggleSave(anomaly.id)} />
      </td>
      <td>
        <ServiceCell variant="budget" svc={anomaly.svc} region={anomaly.region} />
      </td>
      <td style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{anomaly.acct}</td>
      <td>
        <ProviderLabel prov={anomaly.prov} />
      </td>
      <td>
        <div className="cost-main over">{eur(anomaly.cur)}</div>
        <div className="cost-sub">+{eur(overage)}</div>
      </td>
      <td style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>{eur(anomaly.bud)}</td>
      <td>
        <div className="health-wrap">
          <div className="health-track">
            <div className="health-fill" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
          </div>
          <div className="health-pct">{Math.round(pct)}%</div>
        </div>
      </td>
      <td>
        <AlertPill pct={pct} />
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

export function BudgetTable({
  rows,
  isSaved,
  onToggleSave,
  onResolve,
}: {
  rows: BudgetAnomaly[];
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
              <BudgetRow key={a.id} anomaly={a} isSaved={isSaved(a.id)} onToggleSave={onToggleSave} onResolve={onResolve} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
