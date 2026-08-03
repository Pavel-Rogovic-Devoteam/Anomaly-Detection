import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import type { Theme, TimelineView } from '../types';
import { TIMELINE_BUDGET_COSTS, TIMELINE_DAILY_SPEND, TIMELINE_PATTERN_COSTS } from '../data/anomalies';
import type { CurrentMonthTimeline } from '../utils/currentMonthTimeline';
import { computeIQRBounds, isIQROutlier } from '../utils/iqr';
import type { IQRBounds } from '../utils/iqr';
import { eurRounded } from '../utils/format';
import { getChartPalette, getLast30Dates } from '../utils/chartSetup';

const BUDGET_COLOR = '#ef4444';
const PATTERN_COLOR = '#8b5cf6';
const BAND_FILL = 'rgba(148,163,184,0.16)';

type DayType = 'budget' | 'pattern' | null;

function classifyDays(spend: number[], budgetCost: number[], patternCost: number[], bounds: IQRBounds): DayType[] {
  return spend.map((v, i) => {
    if (!isIQROutlier(v, bounds)) return null;
    return (budgetCost[i] ?? 0) >= (patternCost[i] ?? 0) ? 'budget' : 'pattern';
  });
}

export function AnomalyTimelineChart({
  theme,
  view,
  monthData,
}: {
  theme: Theme;
  view: TimelineView;
  monthData: CurrentMonthTimeline | null;
}) {
  const palette = useMemo(() => getChartPalette(theme), [theme]);

  const { labels, spend, budgetCost, patternCost, todayIndex, bounds } = useMemo(() => {
    if (monthData) {
      const elapsed = monthData.spend.slice(0, monthData.todayDate);
      return {
        labels: monthData.labels,
        spend: monthData.spend,
        budgetCost: monthData.budgetCost,
        patternCost: monthData.patternCost,
        todayIndex: monthData.todayDate - 1,
        bounds: computeIQRBounds(elapsed),
      };
    }
    return {
      labels: getLast30Dates(),
      spend: TIMELINE_DAILY_SPEND,
      budgetCost: TIMELINE_BUDGET_COSTS,
      patternCost: TIMELINE_PATTERN_COSTS,
      todayIndex: TIMELINE_DAILY_SPEND.length - 1,
      bounds: computeIQRBounds(TIMELINE_DAILY_SPEND),
    };
  }, [monthData]);

  const showForecast = monthData !== null && monthData.isIncomplete;
  const types = useMemo(() => classifyDays(spend, budgetCost, patternCost, bounds), [spend, budgetCost, patternCost, bounds]);

  const data = useMemo(() => {
    const n = spend.length;
    const lowerBand = new Array(n).fill(Math.max(0, bounds.q1 - 1.5 * bounds.iqr));
    const upperBand = new Array(n).fill(bounds.upperBound);

    const allow = (t: DayType) => {
      if (!t) return false;
      if (view === 'budget') return t === 'budget';
      if (view === 'pattern') return t === 'pattern';
      return true;
    };
    const anomalyPoints = spend.map((v, i) => (allow(types[i]) ? v : null));
    const pointColors = types.map((t) => (t === 'budget' ? BUDGET_COLOR : t === 'pattern' ? PATTERN_COLOR : 'transparent'));

    return {
      labels,
      datasets: [
        {
          label: 'Lower bound',
          data: lowerBand,
          borderWidth: 0,
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Normal range (IQR)',
          data: upperBand,
          borderWidth: 0,
          pointRadius: 0,
          backgroundColor: BAND_FILL,
          fill: '-1' as const,
        },
        {
          label: 'Daily spend',
          data: spend,
          borderColor: palette.textMuted,
          backgroundColor: palette.textMuted,
          borderWidth: 1.5,
          pointRadius: 1.5,
          pointHoverRadius: 4,
          fill: false,
          tension: 0.3,
          ...(showForecast
            ? {
                segment: {
                  borderDash: (ctx: { p1DataIndex: number }) => (ctx.p1DataIndex > todayIndex ? [6, 4] : undefined),
                },
              }
            : {}),
        },
        {
          label: 'Anomaly',
          data: anomalyPoints,
          borderWidth: 0,
          showLine: false,
          pointRadius: 5,
          pointHoverRadius: 6,
          pointBackgroundColor: pointColors,
          pointBorderColor: pointColors,
          spanGaps: false,
        },
      ],
    };
  }, [spend, types, bounds, palette, labels, showForecast, todayIndex, view]);

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
          filter: (item) => item.dataset.label === 'Daily spend',
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => {
              const i = item.dataIndex;
              const value = spend[i];
              const type = types[i];
              const isForecastPoint = showForecast && i > todayIndex;
              const lines = [`Daily spend: ${eurRounded(value)}${isForecastPoint ? ' (forecast)' : ''}`];
              if (type) {
                const cost = type === 'budget' ? budgetCost[i] : patternCost[i];
                const tag = type === 'budget' ? 'Budget breach' : 'Pattern spike';
                lines.push(`⚠ ${tag} — above IQR upper bound (${eurRounded(bounds.upperBound)})`);
                if (cost > 0) lines.push(`  Cost impact: ${eurRounded(cost)}`);
              }
              return lines;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: palette.grid },
          ticks: { color: palette.textMuted, font: { size: 9 }, maxTicksLimit: 8, maxRotation: 0 },
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
    [palette, spend, types, budgetCost, patternCost, bounds, showForecast, todayIndex],
  );

  return (
    <div className="timeline-chart-wrapper">
      <Line data={data} options={options} />
    </div>
  );
}
