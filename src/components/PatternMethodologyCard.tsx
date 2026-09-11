import { useState } from 'react';

const METRICS = [
  { label: 'Baseline', desc: "A service's typical daily spend (€/day) on an ordinary (non-seasonal) day." },
  { label: 'Spike Cost', desc: 'The actual daily spend (€/day) observed on the day being evaluated.' },
  { label: 'Deviation %', desc: 'How far the spike sits above baseline, as a percentage.' },
  {
    label: 'Daily Spend Series',
    desc: 'Up to 6 months of daily values, bucketed by weekday — each day tested against other days sharing its weekday, not the whole week mixed together.',
  },
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
            fixed budget, but a statistical deviation from its own history, drawn from up to 6 months of daily spend
            (set the period above to widen or narrow that window). Detection runs independently per service, using
            the <strong>Interquartile Range (IQR)</strong> method rather than a mean/standard-deviation z-score, since
            IQR stays reliable on skewed, spike-prone cost data where the outliers themselves would otherwise distort
            the average. Bounds are computed <strong>leave-one-out</strong> — excluding the very day being evaluated —
            so one big spike can&apos;t inflate the range it&apos;s about to be judged against.
          </p>

          <p className="methodology-intro">
            Detection is also <strong>seasonal</strong>: a day is compared only to its own weekday&apos;s history, not
            the whole week mixed together. A service that runs a weekly Monday batch job — a BigQuery ingestion, say —
            will show elevated spend every Monday; measured against the full week that looks like a spike, but
            measured against prior Mondays it&apos;s the norm, so it&apos;s correctly left unflagged. The same spend
            showing up on a Wednesday, with no such history behind it, still stands out.
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
            <div className="formula-line">Q1, Q3 = 25th / 75th percentile of days sharing the same weekday, leaving out the day being tested</div>
            <div className="formula-line">IQR = Q3 − Q1</div>
            <div className="formula-line">Upper Bound = Q3 + 1.5 × IQR</div>
            <div className="formula-line">Lower Bound = Q1 − 1.5 × IQR</div>
            <div className="formula-divider" />
            <div className="formula-line">Anomaly if: value &gt; Upper Bound (spike) or value &lt; Lower Bound (unusually low)</div>
          </div>

          <p className="methodology-note">
            In the table below, the IQR outlier badge, sparkline dashed line, and Q1/Q3 tooltip all come from that
            row&apos;s own weekday-bucketed, leave-one-out bounds. In the Pattern Spend chart above, the shaded band
            shows the full-period range for reference, while each day is still flagged against its own weekday&apos;s
            bounds — so a day can occasionally sit just inside the drawn band and still be marked anomalous (or vice
            versa), since a tighter, weekday-specific range can differ from the flat one drawn on screen.
          </p>
        </div>
      )}
    </div>
  );
}
