import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import type { BudgetAnomaly, DistView, PatternAnomaly, Theme } from '../types';
import { categoryFor, SERVICE_CATEGORY_COLORS } from '../data/anomalies';
import { getTooltipStyle } from '../utils/chartSetup';

interface DistRow {
  label: string;
  color: string;
  n: number;
}

function providerRows(all: (BudgetAnomaly | PatternAnomaly)[]): DistRow[] {
  return [
    { label: 'AWS', color: '#ff9900', n: all.filter((a) => a.prov === 'aws').length },
    { label: 'Azure', color: '#00a1f1', n: all.filter((a) => a.prov === 'azure').length },
    { label: 'Google Cloud', color: '#34a853', n: all.filter((a) => a.prov === 'gcp').length },
  ];
}

function serviceRows(all: (BudgetAnomaly | PatternAnomaly)[]): DistRow[] {
  const counts: Record<string, number> = {};
  all.forEach((a) => {
    const cat = categoryFor(a.svc);
    counts[cat] = (counts[cat] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, n]) => ({ label, color: SERVICE_CATEGORY_COLORS[label] || '#6b7280', n }));
}

function toRgba(color: string): string {
  return color.replace(')', ',0.7)').replace('rgb', 'rgba');
}

export function DistributionCard({
  budget,
  pattern,
  view,
  onChangeView,
  theme,
}: {
  budget: BudgetAnomaly[];
  pattern: PatternAnomaly[];
  view: DistView;
  onChangeView: (view: DistView) => void;
  theme: Theme;
}) {
  const all = useMemo(() => [...budget, ...pattern], [budget, pattern]);
  const rows = useMemo(() => (view === 'provider' ? providerRows(all) : serviceRows(all)), [view, all]);
  const total = rows.reduce((s, r) => s + r.n, 0);

  const data = useMemo(
    () => ({
      labels: rows.map((r) => r.label),
      datasets: [
        {
          data: rows.map((r) => r.n),
          backgroundColor: rows.map((r) => toRgba(r.color)),
          borderColor: rows.map((r) => r.color),
          borderWidth: 1.5,
          hoverOffset: 4,
        },
      ],
    }),
    [rows],
  );

  const options: ChartOptions<'doughnut'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: getTooltipStyle(theme),
      },
    }),
    [theme],
  );

  return (
    <div className="card dist-card">
      <div className="card-header">
        <div>
          <div className="card-title">{view === 'provider' ? 'By Provider' : 'By Service'}</div>
          <div className="card-subtitle">Anomaly distribution</div>
        </div>
        <div className="dist-toggle">
          <button className={`dist-toggle-btn${view === 'provider' ? ' active' : ''}`} onClick={() => onChangeView('provider')}>
            Provider
          </button>
          <button className={`dist-toggle-btn${view === 'service' ? ' active' : ''}`} onClick={() => onChangeView('service')}>
            Service
          </button>
        </div>
      </div>
      <div className="donut-wrapper">
        <Doughnut data={data} options={options} />
        <div className="donut-center">
          <div className="donut-center-value">{total}</div>
          <div className="donut-center-label">Anomalies</div>
        </div>
      </div>
      <div className="provider-list">
        {rows.map((r) => (
          <div className="provider-row" key={r.label}>
            <div className="provider-left">
              <div className="provider-dot" style={{ background: r.color }} />
              {r.label}
            </div>
            <div>
              <span className="provider-count">{r.n}</span>
              <span className="provider-pct"> · {Math.round((r.n / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
