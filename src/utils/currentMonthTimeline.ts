import type { MonthSource } from '../data/dataset';
import { TIMELINE_BUDGET_SPEND_RECENT30, TIMELINE_PATTERN_SPEND_RECENT30 } from '../data/anomalies';

export interface CurrentMonthTimeline {
  labels: string[];
  daysInMonth: number;
  todayDate: number;
  isIncomplete: boolean;
  monthLabel: string;
  spend: number[];
  budgetSpend: number[];
  patternSpend: number[];
}

/** Extends an elapsed-so-far series to `totalDays` by cyclically repeating the observed pattern. */
function extendCyclically(soFar: number[], elapsed: number, totalDays: number): number[] {
  return Array.from({ length: totalDays }, (_, i) => (i < elapsed ? soFar[i] : soFar[i % elapsed]));
}

/**
 * With a real `source`, the month is the one containing its last day, and each elapsed day takes that
 * date's actual value. Without one (the sample), it's the real current month filled from a 30-day cycle.
 */
export function buildCurrentMonthTimeline(source: MonthSource | null = null): CurrentMonthTimeline {
  let year: number;
  let monthIndex: number;
  let todayDate: number;
  if (source) {
    const last = new Date(`${source.dates[source.dates.length - 1]}T00:00:00Z`);
    year = last.getUTCFullYear();
    monthIndex = last.getUTCMonth();
    todayDate = last.getUTCDate();
  } else {
    const now = new Date();
    year = now.getFullYear();
    monthIndex = now.getMonth();
    todayDate = now.getDate();
  }
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const labels = Array.from({ length: daysInMonth }, (_, i) =>
    new Date(year, monthIndex, i + 1).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
  );

  let budgetSpendSoFar: number[];
  let patternSpendSoFar: number[];
  if (source) {
    const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}-`;
    const at = (series: number[], day: number) => series[source.dates.indexOf(`${prefix}${String(day).padStart(2, '0')}`)] ?? 0;
    budgetSpendSoFar = Array.from({ length: todayDate }, (_, i) => at(source.budget, i + 1));
    patternSpendSoFar = Array.from({ length: todayDate }, (_, i) => at(source.pattern, i + 1));
  } else {
    budgetSpendSoFar = Array.from({ length: todayDate }, (_, i) => TIMELINE_BUDGET_SPEND_RECENT30[i % TIMELINE_BUDGET_SPEND_RECENT30.length]);
    patternSpendSoFar = Array.from({ length: todayDate }, (_, i) => TIMELINE_PATTERN_SPEND_RECENT30[i % TIMELINE_PATTERN_SPEND_RECENT30.length]);
  }

  const budgetSpend = extendCyclically(budgetSpendSoFar, todayDate, daysInMonth);
  const patternSpend = extendCyclically(patternSpendSoFar, todayDate, daysInMonth);

  return {
    labels,
    daysInMonth,
    todayDate,
    isIncomplete: todayDate < daysInMonth,
    monthLabel: new Date(year, monthIndex, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    spend: budgetSpend.map((v, i) => v + patternSpend[i]),
    budgetSpend,
    patternSpend,
  };
}
