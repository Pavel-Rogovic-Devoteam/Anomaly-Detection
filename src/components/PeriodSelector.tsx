import { useEffect, useRef, useState } from 'react';
import type { PeriodOption } from '../types';
import { getPeriodButtonLabel, PERIOD_LABELS } from '../utils/period';
import type { CustomRange } from '../utils/period';

const OPTIONS: PeriodOption[] = ['current-month', 'last-month', 'last-3-months', 'last-6-months', 'custom'];

export function PeriodSelector({
  period,
  onChangePeriod,
}: {
  period: PeriodOption;
  onChangePeriod: (period: PeriodOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customRange, setCustomRange] = useState<CustomRange | null>(null);
  const [draftStart, setDraftStart] = useState('');
  const [draftEnd, setDraftEnd] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selectOption = (opt: PeriodOption) => {
    onChangePeriod(opt);
    if (opt !== 'custom') setOpen(false);
  };

  const applyCustomRange = () => {
    if (!draftStart || !draftEnd) return;
    setCustomRange({ start: draftStart, end: draftEnd });
    setOpen(false);
  };

  return (
    <div className="period-selector" ref={wrapRef}>
      <button className="page-btn" onClick={() => setOpen((v) => !v)}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {getPeriodButtonLabel(period, customRange)}
      </button>

      {open && (
        <div className="period-menu">
          {OPTIONS.map((opt) => (
            <div
              key={opt}
              className={`period-menu-item${period === opt ? ' active' : ''}`}
              onClick={() => selectOption(opt)}
            >
              {opt === 'custom' ? 'Custom period' : PERIOD_LABELS[opt]}
            </div>
          ))}
          {period === 'custom' && (
            <div className="period-custom-range">
              <input type="date" value={draftStart} onChange={(e) => setDraftStart(e.target.value)} />
              <input type="date" value={draftEnd} onChange={(e) => setDraftEnd(e.target.value)} />
              <button className="page-btn accent" onClick={applyCustomRange} disabled={!draftStart || !draftEnd}>
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
