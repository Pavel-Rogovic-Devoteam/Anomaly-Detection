import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartOptions, TooltipItem } from 'chart.js';
import type { BudgetAnomaly, PatternAnomaly, Theme, TimelineView } from '../types';
import {
  TIMELINE_BUDGET_COSTS,
  TIMELINE_BUDGET_COUNTS,
  TIMELINE_PATTERN_COSTS,
  TIMELINE_PATTERN_COUNTS,
} from '../data/anomalies';
import type { CurrentMonthTimeline } from '../utils/currentMonthTimeline';
import { eurRounded } from '../utils/format';
import { getChartPalette, getLast30Dates } from '../utils/chartSetup';

const BUDGET_LABEL = 'Budget-Based';
const PATTERN_LABEL = 'Pattern-Based';
const BUDGET_PREDICTED_LABEL = 'Budget-Based (predicted)';
const PATTERN_PREDICTED_LABEL = 'Pattern-Based (predicted)';

function buildNameArrays(budget: BudgetAnomaly[], pattern: PatternAnomaly[]) {
  const bNames: string[][] = Array.from({ length: 30 }, () => []);
  const pNames: string[][] = Array.from({ length: 30 }, () => []);
  budget.forEach((a) => {
    const i = 29 - a.ago;
    if (i >= 0) bNames[i].push(a.svc);
  });
  pattern.forEach((a) => {
    const i = 29 - a.ago;
    if (i >= 0) pNames[i].push(a.svc);
  });
  return { bNames, pNames };
}

export function AnomalyTimelineChart({
  budget,
  pattern,
  theme,
  view,
  monthData,
}: {
  budget: BudgetAnomaly[];
  pattern: PatternAnomaly[];
  theme: Theme;
  view: TimelineView;
  monthData: CurrentMonthTimeline | null;
}) {
  const { bNames, pNames } = useMemo(() => buildNameArrays(budget, pattern), [budget, pattern]);
  const palette = useMemo(() => getChartPalette(theme), [theme]);

  const showBudget = view !== 'pattern';
  const showPattern = view !== 'budget';
  const useMonthData = monthData !== null;
  const showForecast = useMonthData && monthData.isIncomplete;

  const data = useMemo(() => {
    if (useMonthData && monthData) {
      const datasets = [];
      if (showBudget) {
        datasets.push({
          label: BUDGET_LABEL,
          data: monthData.budgetActual,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.06)',
          borderWidth: 1.5,
          pointRadius: 1.5,
          pointHoverRadius: 4,
          fill: true,
          tension: 0.4,
          spanGaps: false,
        });
        if (showForecast) {
          datasets.push({
            label: BUDGET_PREDICTED_LABEL,
            data: monthData.budgetPredicted,
            borderColor: '#ef4444',
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderDash: [6, 4],
            pointRadius: 1.5,
            pointHoverRadius: 4,
            fill: false,
            tension: 0.4,
            spanGaps: false,
          });
        }
      }
      if (showPattern) {
        datasets.push({
          label: PATTERN_LABEL,
          data: monthData.patternActual,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139,92,246,0.06)',
          borderWidth: 1.5,
          pointRadius: 1.5,
          pointHoverRadius: 4,
          fill: true,
          tension: 0.4,
          spanGaps: false,
        });
        if (showForecast) datasets.push({
          label: PATTERN_PREDICTED_LABEL,
          data: monthData.patternPredicted,
          borderColor: '#8b5cf6',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [6, 4],
          pointRadius: 1.5,
          pointHoverRadius: 4,
          fill: false,
          tension: 0.4,
          spanGaps: false,
        });
      }
      return { labels: monthData.labels, datasets };
    }

    const datasets = [];
    if (showBudget) {
      datasets.push({
        label: BUDGET_LABEL,
        data: TIMELINE_BUDGET_COUNTS,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.06)',
        borderWidth: 1.5,
        pointRadius: 1.5,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.4,
      });
    }
    if (showPattern) {
      datasets.push({
        label: PATTERN_LABEL,
        data: TIMELINE_PATTERN_COUNTS,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.06)',
        borderWidth: 1.5,
        pointRadius: 1.5,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.4,
      });
    }
    return { labels: getLast30Dates(), datasets };
  }, [showBudget, showPattern, showForecast, useMonthData, monthData]);

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
          filter: (item) => {
            // The predicted line repeats the actual value on the "today" bridge
            // point just so the dashed segment connects visually — don't show
            // it a second time in the tooltip.
            if (showForecast && monthData && item.dataset.label?.includes('(predicted)') && item.dataIndex === monthData.todayDate - 1) {
              return false;
            }
            return (item.raw as number) > 0;
          },
          callbacks: {
            title: (items) => items[0].label,
            label: (item: TooltipItem<'line'>) => {
              const count = item.raw as number;
              const label = item.dataset.label ?? '';
              const unit = count === 1 ? 'anomaly' : 'anomalies';

              if (showForecast) {
                const isPredicted = label.includes('(predicted)');
                const baseLabel = label.replace(' (predicted)', '');
                return isPredicted ? `${baseLabel}: ${count} ${unit} (forecast)` : `${baseLabel}: ${count} ${unit}`;
              }

              const isBudget = label === BUDGET_LABEL;
              const cost = isBudget ? TIMELINE_BUDGET_COSTS[item.dataIndex] : TIMELINE_PATTERN_COSTS[item.dataIndex];
              const names = isBudget ? bNames[item.dataIndex] : pNames[item.dataIndex];
              const lines = [`${label}: ${count} ${unit}`];
              if (cost > 0) {
                const tag = isBudget ? 'overage' : 'spike cost';
                lines.push(`  Cost impact: ${eurRounded(cost)} ${tag}`);
                names.forEach((n) => lines.push(`  · ${n}`));
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
          ticks: { color: palette.textMuted, font: { size: 9 }, stepSize: 1 },
          border: { display: false },
          min: 0,
        },
      },
    }),
    [bNames, pNames, palette, showForecast, monthData],
  );

  return (
    <div className="timeline-chart-wrapper">
      <Line data={data} options={options} />
    </div>
  );
}
