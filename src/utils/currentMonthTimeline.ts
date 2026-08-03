import { TIMELINE_BUDGET_SPEND, TIMELINE_PATTERN_SPEND } from '../data/anomalies';

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

export function buildCurrentMonthTimeline(): CurrentMonthTimeline {
  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const todayDate = now.getDate();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const labels = Array.from({ length: daysInMonth }, (_, i) =>
    new Date(year, monthIndex, i + 1).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
  );

  const budgetSpendSoFar = Array.from({ length: todayDate }, (_, i) => TIMELINE_BUDGET_SPEND[i % TIMELINE_BUDGET_SPEND.length]);
  const patternSpendSoFar = Array.from({ length: todayDate }, (_, i) => TIMELINE_PATTERN_SPEND[i % TIMELINE_PATTERN_SPEND.length]);

  const budgetSpend = extendCyclically(budgetSpendSoFar, todayDate, daysInMonth);
  const patternSpend = extendCyclically(patternSpendSoFar, todayDate, daysInMonth);

  return {
    labels,
    daysInMonth,
    todayDate,
    isIncomplete: todayDate < daysInMonth,
    monthLabel: now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    spend: budgetSpend.map((v, i) => v + patternSpend[i]),
    budgetSpend,
    patternSpend,
  };
}
