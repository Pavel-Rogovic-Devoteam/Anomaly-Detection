import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import type { Theme, TimelineView } from '../types';
import { TIMELINE_BUDGET_SPEND, TIMELINE_DAILY_SPEND, TIMELINE_PATTERN_SPEND } from '../data/anomalies';
import type { CurrentMonthTimeline } from '../utils/currentMonthTimeline';
import { computeIQRBounds, isIQROutlier } from '../utils/iqr';
import { eurRounded } from '../utils/format';
import { getChartPalette, getLast30Dates } from '../utils/chartSetup';

const BUDGET_COLOR = '#ef4444';
const PATTERN_COLOR = '#8b5cf6';
const BAND_FILL = 'rgba(148,163,184,0.16)';

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

  const { labels, spend, budgetSpend, patternSpend, todayIndex, spendBounds, budgetBounds, patternBounds } = useMemo(() => {
    if (monthData) {
      const elapsed = monthData.todayDate;
      return {
        labels: monthData.labels,
        spend: monthData.spend,
        budgetSpend: monthData.budgetSpend,
        patternSpend: monthData.patternSpend,
        todayIndex: elapsed - 1,
        spendBounds: computeIQRBounds(monthData.spend.slice(0, elapsed)),
        budgetBounds: computeIQRBounds(monthData.budgetSpend.slice(0, elapsed)),
        patternBounds: computeIQRBounds(monthData.patternSpend.slice(0, elapsed)),
      };
    }
    return {
      labels: getLast30Dates(),
      spend: TIMELINE_DAILY_SPEND,
      budgetSpend: TIMELINE_BUDGET_SPEND,
      patternSpend: TIMELINE_PATTERN_SPEND,
      todayIndex: TIMELINE_DAILY_SPEND.length - 1,
      spendBounds: computeIQRBounds(TIMELINE_DAILY_SPEND),
      budgetBounds: computeIQRBounds(TIMELINE_BUDGET_SPEND),
      patternBounds: computeIQRBounds(TIMELINE_PATTERN_SPEND),
    };
  }, [monthData]);

  const showForecast = monthData !== null && monthData.isIncomplete;

  const isBudgetOutlier = useMemo(() => budgetSpend.map((v) => isIQROutlier(v, budgetBounds)), [budgetSpend, budgetBounds]);
  const isPatternOutlier = useMemo(() => patternSpend.map((v) => isIQROutlier(v, patternBounds)), [patternSpend, patternBounds]);

  const showBudgetDots = view !== 'pattern';
  const showPatternDots = view !== 'budget';

  const data = useMemo(() => {
    const n = spend.length;
    const lowerBand = new Array(n).fill(Math.max(0, spendBounds.q1 - 1.5 * spendBounds.iqr));
    const upperBand = new Array(n).fill(spendBounds.upperBound);

    const budgetPoints = spend.map((v, i) => (showBudgetDots && isBudgetOutlier[i] ? v : null));
    const patternPoints = spend.map((v, i) => (showPatternDots && isPatternOutlier[i] ? v : null));

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
          label: 'Pattern anomaly',
          data: patternPoints,
          borderWidth: 0,
          showLine: false,
          pointRadius: 6,
          pointHoverRadius: 7,
          pointBackgroundColor: PATTERN_COLOR,
          pointBorderColor: PATTERN_COLOR,
          spanGaps: false,
        },
        {
          label: 'Budget anomaly',
          data: budgetPoints,
          borderWidth: 0,
          showLine: false,
          pointRadius: 5,
          pointHoverRadius: 6,
          pointBackgroundColor: BUDGET_COLOR,
          pointBorderColor: BUDGET_COLOR,
          spanGaps: false,
        },
      ],
    };
  }, [spend, isBudgetOutlier, isPatternOutlier, showBudgetDots, showPatternDots, spendBounds, palette, labels, showForecast, todayIndex]);

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
              const isForecastPoint = showForecast && i > todayIndex;
              const lines = [`Daily spend: ${eurRounded(value)}${isForecastPoint ? ' (forecast)' : ''}`];
              if (isBudgetOutlier[i]) {
                lines.push(`⚠ Budget breach — above IQR upper bound (${eurRounded(budgetBounds.upperBound)})`);
              }
              if (isPatternOutlier[i]) {
                lines.push(`⚠ Pattern spike — above IQR upper bound (${eurRounded(patternBounds.upperBound)})`);
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
    [palette, spend, isBudgetOutlier, isPatternOutlier, budgetBounds, patternBounds, showForecast, todayIndex],
  );

  return (
    <div className="timeline-chart-wrapper">
      <Line data={data} options={options} />
    </div>
  );
}
