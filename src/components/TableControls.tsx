import type { SeverityFilter } from '../types';

const SEV_FILTERS: { key: SeverityFilter; label: string; dot?: string }[] = [
  { key: 'critical', label: 'Critical', dot: '#f87171' },
  { key: 'high', label: 'High', dot: '#fb923c' },
  { key: 'medium', label: 'Medium', dot: '#fbbf24' },
];

export function TableControls({
  search,
  onSearchChange,
  activeSev,
  onSetSev,
  savedOnly,
  onToggleSavedOnly,
  savedCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  activeSev: SeverityFilter;
  onSetSev: (sev: SeverityFilter) => void;
  savedOnly: boolean;
  onToggleSavedOnly: () => void;
  savedCount: number;
}) {
  return (
    <div className="table-controls">
      <div className="search-box">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input type="text" placeholder="Search…" value={search} onChange={(e) => onSearchChange(e.target.value)} />
      </div>

      <div className={`filter-btn${activeSev === 'all' ? ' active' : ''}`} onClick={() => onSetSev('all')}>
        All Filters
      </div>

      {SEV_FILTERS.map((f) => (
        <div key={f.key} className={`filter-btn${activeSev === f.key ? ' active' : ''}`} onClick={() => onSetSev(f.key)}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: f.dot, flexShrink: 0, display: 'inline-block' }} />
          {f.label}
        </div>
      ))}

      <div className={`filter-btn${savedOnly ? ' active' : ''}`} onClick={onToggleSavedOnly} title="Show only saved anomalies">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
          <path d="M6 3h12a1 1 0 0 1 1 1v16l-7-4-7 4V4a1 1 0 0 1 1-1z" />
        </svg>
        Saved <span style={{ opacity: 0.7 }}>{savedCount}</span>
      </div>

      <div className="controls-spacer" />

      <div className="icon-btn" title="Toggle columns">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </div>
      <div className="icon-btn" title="Export CSV">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </div>
    </div>
  );
}
