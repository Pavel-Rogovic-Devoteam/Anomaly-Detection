import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import type { Theme } from '../types';
import { TIMELINE_BUDGET_SPEND, TIMELINE_PATTERN_SPEND } from '../data/anomalies';
import type { CurrentMonthTimeline } from '../utils/currentMonthTimeline';
import { computeIQRBounds, isIQROutlier } from '../utils/iqr';
import { daySuffix, eurRounded } from '../utils/format';
import { getChartPalette, getLast30Dates } from '../utils/chartSetup';

type AnomalyType = 'budget' | 'pattern';

const CONFIG: Record<AnomalyType, { label: string; color: string; fill: string }> = {
  budget: { label: 'Budget', color: '#ef4444', fill: 'rgba(239,68,68,0.16)' },
  pattern: { label: 'Pattern', color: '#8b5cf6', fill: 'rgba(139,92,246,0.18)' },
};

const BAND_FILL = 'rgba(148,163,184,0.16)';

interface SegmentCtx {
  p0DataIndex: number;
  p1DataIndex: number;
}

interface CrosshairChart {
  tooltip?: { getActiveElements?: () => { element: { x: number } }[] };
  chartArea: { top: number; bottom: number };
  ctx: CanvasRenderingContext2D;
}

export function SpendAnomalyPanel({
  type,
  theme,
  monthData,
}: {
  type: AnomalyType;
  theme: Theme;
  monthData: CurrentMonthTimeline | null;
}) {
  const cfg = CONFIG[type];
  const palette = useMemo(() => getChartPalette(theme), [theme]);

  const { labels, spend, todayIndex, bounds } = useMemo(() => {
    if (monthData) {
      const elapsed = monthData.todayDate;
      const source = type === 'budget' ? monthData.budgetSpend : monthData.patternSpend;
      return {
        labels: monthData.labels,
        spend: source,
        todayIndex: elapsed - 1,
        bounds: computeIQRBounds(source.slice(0, elapsed)),
      };
    }
    const source = type === 'budget' ? TIMELINE_BUDGET_SPEND : TIMELINE_PATTERN_SPEND;
    return {
      labels: getLast30Dates(),
      spend: source,
      todayIndex: source.length - 1,
      bounds: computeIQRBounds(source),
    };
  }, [monthData, type]);

  const showForecast = monthData !== null && monthData.isIncomplete;
  const isOutlier = useMemo(() => spend.map((v) => isIQROutlier(v, bounds)), [spend, bounds]);

  const stats = useMemo(() => {
    let hitCount = 0;
    let maxRatio = 1;
    spend.forEach((v, i) => {
      if (isOutlier[i]) {
        hitCount++;
        maxRatio = Math.max(maxRatio, v / bounds.upperBound);
      }
    });
    return {
      multiplier: maxRatio,
      pctOfDays: spend.length ? Math.round((hitCount / spend.length) * 100) : 0,
      peak: Math.max(...spend),
    };
  }, [spend, isOutlier, bounds]);

  const data = useMemo(() => {
    const n = spend.length;
    const lowerBand = new Array(n).fill(Math.max(0, bounds.q1 - 1.5 * bounds.iqr));
    const upperBand = new Array(n).fill(bounds.upperBound);

    return {
      labels,
      datasets: [
        { label: 'Lower bound', data: lowerBand, borderWidth: 0, pointRadius: 0, fill: false },
        { label: 'Normal range (IQR)', data: upperBand, borderWidth: 0, pointRadius: 0, backgroundColor: BAND_FILL, fill: '-1' as const },
        {
          label: 'Spend',
          data: spend,
          borderColor: palette.textMuted,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: palette.textMuted,
          fill: 1,
          tension: 0.4,
          segment: {
            borderColor: (ctx: SegmentCtx) => (isOutlier[ctx.p0DataIndex] || isOutlier[ctx.p1DataIndex] ? cfg.color : palette.textMuted),
            backgroundColor: (ctx: SegmentCtx) => (isOutlier[ctx.p0DataIndex] || isOutlier[ctx.p1DataIndex] ? cfg.fill : 'transparent'),
            ...(showForecast
              ? { borderDash: (ctx: SegmentCtx) => (ctx.p1DataIndex > todayIndex ? [6, 4] : undefined) }
              : {}),
          },
        },
      ],
    };
  }, [spend, isOutlier, bounds, palette, labels, showForecast, todayIndex, cfg]);

  const crosshairPlugin = useMemo(
    () => ({
      id: `crosshair-${type}`,
      afterDraw(chart: CrosshairChart) {
        const active = chart.tooltip?.getActiveElements?.();
        if (!active || !active.length) return;
        const { x } = active[0].element;
        const { top, bottom } = chart.chartArea;
        const { ctx } = chart;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.lineWidth = 1;
        ctx.strokeStyle = palette.border2;
        ctx.stroke();
        ctx.restore();
      },
    }),
    [palette, type],
  );

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          animation: false,
          backgroundColor: palette.surface2,
          borderColor: palette.border2,
          borderWidth: 1,
          titleColor: palette.text,
          bodyColor: palette.textMuted,
          padding: 12,
          cornerRadius: 6,
          boxPadding: 4,
          filter: (item) => item.dataset.label === 'Spend',
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => {
              const i = item.dataIndex;
              const isForecastPoint = showForecast && i > todayIndex;
              const lines = [`${cfg.label} spend: ${eurRounded(spend[i])}${isForecastPoint ? ' (forecast)' : ''}`];
              if (isOutlier[i]) lines.push(`⚠ Above IQR upper bound (${eurRounded(bounds.upperBound)})`);
              return lines;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: palette.grid },
          ticks: { color: palette.textMuted, font: { size: 9 }, maxTicksLimit: 6, maxRotation: 0 },
          border: { display: false },
        },
        y: {
          grid: { color: palette.grid },
          ticks: { color: palette.textMuted, font: { size: 9 }, callback: (v) => `€${v}` },
          border: { display: false },
          min: 0,
        },
      },
    }),
    [palette, spend, isOutlier, bounds, showForecast, todayIndex, cfg],
  );

  return (
    <div className="card panel-card">
      <div className="card-header">
        <div>
          <div className="card-title">{cfg.label} Spend</div>
          <div className="card-subtitle">
            {monthData
              ? monthData.isIncomplete
                ? `${monthData.monthLabel} · actual through the ${monthData.todayDate}${daySuffix(monthData.todayDate)}, forecast after`
                : monthData.monthLabel
              : 'Apr 6 – May 7, 2026'}
          </div>
        </div>
      </div>

      <div className="timeline-stats">
        <div className="timeline-stat">
          <div className="timeline-stat-label">
            <span className="timeline-stat-dot" style={{ background: cfg.color }} />
            Above Normal
          </div>
          <div className="timeline-stat-value">{stats.multiplier.toFixed(1)}x</div>
          <div className="timeline-stat-sub">{stats.pctOfDays}% of days</div>
        </div>
        <div className="timeline-stat">
          <div className="timeline-stat-label">
            <span className="timeline-stat-dot" style={{ background: 'var(--text-muted)' }} />
            Normal Range
          </div>
          <div className="timeline-stat-value">
            {eurRounded(bounds.q1)}–{eurRounded(bounds.upperBound)}
          </div>
        </div>
        <div className="timeline-stat">
          <div className="timeline-stat-label">
            <span className="timeline-stat-dot" style={{ background: palette.textMuted }} />
            Peak
          </div>
          <div className="timeline-stat-value">{eurRounded(stats.peak)}</div>
        </div>
      </div>

      <div className="timeline-chart-wrapper">
        <Line data={data} options={options} plugins={[crosshairPlugin]} />
      </div>

      <div className="anomaly-ribbon">
        {spend.map((v, i) => (
          <div
            key={i}
            className="anomaly-ribbon-cell"
            style={isOutlier[i] ? { background: cfg.color } : undefined}
            title={`${labels[i]}: ${eurRounded(v)}${isOutlier[i] ? ' — anomaly' : ''}`}
          />
        ))}
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-line" style={{ background: 'var(--text-muted)' }} />
          Spend
        </div>
        <div className="legend-item">
          <div className="legend-swatch" />
          Normal range (IQR)
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: cfg.color }} />
          Anomaly
        </div>
        {showForecast && (
          <div className="legend-item">
            <div className="legend-line dashed" style={{ borderTopColor: 'var(--text-muted)' }} />
            Forecast
          </div>
        )}
      </div>
    </div>
  );
}
