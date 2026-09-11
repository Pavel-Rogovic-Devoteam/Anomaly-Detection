import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import type { IQRBounds } from '../utils/iqr';
import type { Theme } from '../types';
import { TIMELINE_BUDGET_SPEND, TIMELINE_DOW, TIMELINE_PATTERN_SPEND } from '../data/anomalies';
import type { CurrentMonthTimeline } from '../utils/currentMonthTimeline';
import {
  computeIQRBounds,
  computeIQRBoundsExcluding,
  computeSeasonalIQRBoundsAt,
  getOutlierDirection,
  WEEKDAY_NAMES,
} from '../utils/iqr';
import { daySuffix, eurRounded } from '../utils/format';
import { getChartPalette, getLastNDates } from '../utils/chartSetup';

type AnomalyType = 'budget' | 'pattern';

const CONFIG: Record<AnomalyType, { label: string; color: string; fill: string }> = {
  budget: { label: 'Budget', color: '#ef4444', fill: 'rgba(239,68,68,0.16)' },
  pattern: { label: 'Pattern', color: '#8b5cf6', fill: 'rgba(139,92,246,0.18)' },
};

const BAND_FILL = 'rgba(148,163,184,0.16)';

const LOW_CONFIG = { label: 'Below Normal', color: '#3b82f6', fill: 'rgba(59,130,246,0.16)' };

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
  days,
}: {
  type: AnomalyType;
  theme: Theme;
  monthData: CurrentMonthTimeline | null;
  days: number;
}) {
  const cfg = CONFIG[type];
  const palette = useMemo(() => getChartPalette(theme), [theme]);
  const showLowSide = type === 'pattern';

  // `bounds` is a single flat range used for the chart's drawn band and the "Normal Range" KPI —
  // a stable visual reference for the period. `dayBounds[i]` is what actually decides whether day
  // `i` is flagged: leave-one-out (excluding the day from its own baseline) so it can't inflate the
  // range it's judged against, and — for Pattern, outside the current-month forecast view — bucketed
  // by weekday, so a routine Monday pattern doesn't read as an anomaly relative to the rest of the week.
  const { labels, spend, todayIndex, bounds, dayBounds, weekday } = useMemo(() => {
    if (monthData) {
      const elapsed = monthData.todayDate;
      const source = type === 'budget' ? monthData.budgetSpend : monthData.patternSpend;
      const sample = source.slice(0, elapsed);
      const flatBounds = computeIQRBounds(sample);
      const dayBounds = source.map((_, i) => (i < elapsed ? computeIQRBoundsExcluding(sample, i) : flatBounds));
      return {
        labels: monthData.labels,
        spend: source,
        todayIndex: elapsed - 1,
        bounds: flatBounds,
        dayBounds,
        weekday: source.map(() => null as string | null),
      };
    }
    const fullSource = type === 'budget' ? TIMELINE_BUDGET_SPEND : TIMELINE_PATTERN_SPEND;
    const n = Math.min(days, fullSource.length);
    const offset = fullSource.length - n;
    const flatBounds = computeIQRBounds(fullSource);
    const dayBounds = Array.from({ length: n }, (_, i) => {
      const fullIdx = offset + i;
      return type === 'pattern'
        ? computeSeasonalIQRBoundsAt(fullSource, TIMELINE_DOW, fullIdx)
        : computeIQRBoundsExcluding(fullSource, fullIdx);
    });
    const weekday = Array.from({ length: n }, (_, i) => (type === 'pattern' ? WEEKDAY_NAMES[TIMELINE_DOW[offset + i]] : null));
    return {
      labels: getLastNDates(n),
      spend: fullSource.slice(-n),
      todayIndex: n - 1,
      bounds: flatBounds,
      dayBounds,
      weekday,
    };
  }, [monthData, type, days]);

  const showForecast = monthData !== null && monthData.isIncomplete;

  const direction = useMemo(
    () =>
      spend.map((v, i) => {
        const dir = getOutlierDirection(v, dayBounds[i]);
        return !showLowSide && dir === 'low' ? null : dir;
      }),
    [spend, dayBounds, showLowSide],
  );

  const stats = useMemo(() => {
    let aboveCount = 0;
    let belowCount = 0;
    let maxRatio = 1;
    let minRatio = 1;
    spend.forEach((v, i) => {
      if (direction[i] === 'high') {
        aboveCount++;
        maxRatio = Math.max(maxRatio, v / bounds.upperBound);
      } else if (direction[i] === 'low') {
        belowCount++;
        if (bounds.lowerBound > 0) minRatio = Math.min(minRatio, v / bounds.lowerBound);
      }
    });
    return {
      aboveMultiplier: maxRatio,
      abovePct: spend.length ? Math.round((aboveCount / spend.length) * 100) : 0,
      belowMultiplier: minRatio,
      belowPct: spend.length ? Math.round((belowCount / spend.length) * 100) : 0,
      peak: Math.max(...spend),
    };
  }, [spend, direction, bounds]);

  const data = useMemo(() => {
    const n = spend.length;
    const lowerBand = new Array(n).fill(Math.max(0, bounds.lowerBound));
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
            borderColor: (ctx: SegmentCtx) => {
              const dir = direction[ctx.p0DataIndex] ?? direction[ctx.p1DataIndex];
              return dir === 'high' ? cfg.color : dir === 'low' ? LOW_CONFIG.color : palette.textMuted;
            },
            backgroundColor: (ctx: SegmentCtx) => {
              const dir = direction[ctx.p0DataIndex] ?? direction[ctx.p1DataIndex];
              return dir === 'high' ? cfg.fill : dir === 'low' ? LOW_CONFIG.fill : 'transparent';
            },
            ...(showForecast
              ? { borderDash: (ctx: SegmentCtx) => (ctx.p1DataIndex > todayIndex ? [6, 4] : undefined) }
              : {}),
          },
        },
      ],
    };
  }, [spend, direction, bounds, palette, labels, showForecast, todayIndex, cfg]);

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
              const b: IQRBounds = dayBounds[i];
              const wd = weekday[i];
              if (direction[i] === 'high') {
                lines.push(wd ? `⚠ Above normal for a ${wd} (${eurRounded(b.upperBound)})` : `⚠ Above IQR upper bound (${eurRounded(b.upperBound)})`);
              }
              if (direction[i] === 'low') {
                lines.push(wd ? `⚠ Below normal for a ${wd} (${eurRounded(b.lowerBound)})` : `⚠ Below IQR lower bound (${eurRounded(b.lowerBound)})`);
              }
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
    [palette, spend, direction, dayBounds, weekday, showForecast, todayIndex, cfg],
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
              : `${labels[0]} – ${labels[labels.length - 1]}, 2026`}
          </div>
        </div>
      </div>

      <div className="timeline-stats">
        <div className="timeline-stat timeline-stat--above">
          <div className="timeline-stat-label">
            <span className="timeline-stat-dot" style={{ background: cfg.color }} />
            Above Normal
          </div>
          <div className="timeline-stat-value">{stats.aboveMultiplier.toFixed(1)}x</div>
          <div className="timeline-stat-sub">{stats.abovePct}% of days</div>
        </div>
        {showLowSide && (
          <div className="timeline-stat timeline-stat--below">
            <div className="timeline-stat-label">
              <span className="timeline-stat-dot" style={{ background: LOW_CONFIG.color }} />
              Below Normal
            </div>
            <div className="timeline-stat-value">{stats.belowMultiplier.toFixed(1)}x</div>
            <div className="timeline-stat-sub">{stats.belowPct}% of days</div>
          </div>
        )}
        <div className="timeline-stat timeline-stat--range">
          <div className="timeline-stat-label">
            <span className="timeline-stat-dot" style={{ background: 'var(--text-muted)' }} />
            Normal Range
          </div>
          <div className="timeline-stat-value">
            {eurRounded(bounds.q1)}–{eurRounded(bounds.upperBound)}
          </div>
        </div>
        <div className="timeline-stat timeline-stat--peak">
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
        {spend.map((v, i) => {
          const dir = direction[i];
          const cellColor = dir === 'high' ? cfg.color : dir === 'low' ? LOW_CONFIG.color : undefined;
          return (
            <div
              key={i}
              className="anomaly-ribbon-cell"
              style={cellColor ? { background: cellColor } : undefined}
              title={`${labels[i]}: ${eurRounded(v)}${dir ? ' — anomaly' : ''}`}
            />
          );
        })}
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
          Above Normal
        </div>
        {showLowSide && (
          <div className="legend-item">
            <div className="legend-dot" style={{ background: LOW_CONFIG.color }} />
            Below Normal
          </div>
        )}
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
