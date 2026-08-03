import { TIMELINE_BUDGET_COUNTS, TIMELINE_PATTERN_COUNTS } from '../data/anomalies';

export interface CurrentMonthTimeline {
  labels: string[];
  daysInMonth: number;
  todayDate: number;
  isIncomplete: boolean;
  monthLabel: string;
  budgetActual: (number | null)[];
  budgetPredicted: (number | null)[];
  patternActual: (number | null)[];
  patternPredicted: (number | null)[];
}

/** Naive-cyclical forecast: repeats the pattern observed so far this month, on a loop. */
function forecastRemainingDays(actualSoFar: number[], elapsed: number, totalDays: number): (number | null)[] {
  const predicted: (number | null)[] = new Array(totalDays).fill(null);
  if (elapsed === 0) return predicted;

  predicted[elapsed - 1] = actualSoFar[elapsed - 1];
  for (let i = elapsed; i < totalDays; i++) {
    predicted[i] = actualSoFar[i % elapsed];
  }
  return predicted;
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

  const budgetActualSoFar = Array.from({ length: todayDate }, (_, i) => TIMELINE_BUDGET_COUNTS[i % TIMELINE_BUDGET_COUNTS.length]);
  const patternActualSoFar = Array.from({ length: todayDate }, (_, i) => TIMELINE_PATTERN_COUNTS[i % TIMELINE_PATTERN_COUNTS.length]);

  const padding: null[] = new Array(daysInMonth - todayDate).fill(null);

  return {
    labels,
    daysInMonth,
    todayDate,
    isIncomplete: todayDate < daysInMonth,
    monthLabel: now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    budgetActual: [...budgetActualSoFar, ...padding],
    budgetPredicted: forecastRemainingDays(budgetActualSoFar, todayDate, daysInMonth),
    patternActual: [...patternActualSoFar, ...padding],
    patternPredicted: forecastRemainingDays(patternActualSoFar, todayDate, daysInMonth),
  };
}
