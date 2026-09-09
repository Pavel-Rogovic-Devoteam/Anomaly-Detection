import { useState } from 'react';

const METRICS = [
  { label: '30-Day Baseline', desc: "A service's typical daily spend (€/day) over its trailing 30-day window." },
  { label: 'Spike Cost', desc: 'The actual daily spend (€/day) observed on the day being evaluated.' },
  { label: 'Deviation %', desc: 'How far the spike sits above baseline, as a percentage.' },
  { label: 'Daily Spend Series', desc: "The full 30 daily values that feed the statistical bounds below." },
];

export function PatternMethodologyCard() {
  const [open, setOpen] = useState(true);

  return (
    <div className="card methodology-card">
      <div className="card-header methodology-header" onClick={() => setOpen((v) => !v)}>
        <div>
          <div className="card-title">How Pattern-Based Detection Works</div>
          <div className="card-subtitle">Metrics &amp; formulas used to flag anomalies</div>
        </div>
        <button className="methodology-toggle" aria-label={open ? 'Collapse' : 'Expand'}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="methodology-body">
          <p className="methodology-intro">
            Pattern-based anomalies flag days where a service&apos;s spend breaks from its own recent behavior — not a
            fixed budget, but a statistical deviation from its 30-day pattern. Detection runs independently per
            service, using the <strong>Interquartile Range (IQR)</strong> method rather than a mean/standard-deviation
            z-score, since IQR stays reliable on skewed, spike-prone cost data where the outliers themselves would
            otherwise distort the average.
          </p>

          <div className="methodology-section-label">Metrics used</div>
          <div className="methodology-metrics">
            {METRICS.map((m) => (
              <div className="metric-item" key={m.label}>
                <div className="metric-item-label">{m.label}</div>
                <div className="metric-item-desc">{m.desc}</div>
              </div>
            ))}
          </div>

          <div className="methodology-section-label">Formulas</div>
          <div className="methodology-formulas">
            <div className="formula-line">Deviation % = (Spike − Baseline) / Baseline × 100</div>
            <div className="formula-divider" />
            <div className="formula-line">Q1, Q3 = 25th / 75th percentile of the 30-day series</div>
            <div className="formula-line">IQR = Q3 − Q1</div>
            <div className="formula-line">Upper Bound = Q3 + 1.5 × IQR</div>
            <div className="formula-line">Lower Bound = Q1 − 1.5 × IQR</div>
            <div className="formula-divider" />
            <div className="formula-line">Anomaly if: value &gt; Upper Bound (spike) or value &lt; Lower Bound (unusually low)</div>
          </div>

          <p className="methodology-note">
            The IQR outlier badge and sparkline in the table below, and the shaded band in the Pattern Spend chart
            above, are both driven by these same bounds — recomputed independently per service for the table, and
            once for the full Pattern-spend channel for the chart.
          </p>
        </div>
      )}
    </div>
  );
}
