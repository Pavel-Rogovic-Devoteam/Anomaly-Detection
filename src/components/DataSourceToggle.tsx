import type { DatasetId } from '../data/dataset';

const OPTIONS: { id: DatasetId; label: string; title: string }[] = [
  { id: 'pulse-demo', label: 'Pulse Demo', title: 'Snapshot of real cost and budget data from the Pulse "Demo" organization' },
  { id: 'sample', label: 'Sample', title: 'Synthetic data with a built-in weekly Monday pattern' },
];

export function DataSourceToggle({ value, onChange }: { value: DatasetId; onChange: (id: DatasetId) => void }) {
  return (
    <div className="dist-toggle" role="group" aria-label="Data source">
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          className={`dist-toggle-btn${value === o.id ? ' active' : ''}`}
          title={o.title}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
