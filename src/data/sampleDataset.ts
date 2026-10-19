import type { PatternAnomaly } from '../types';
import { getLastNDates } from '../utils/chartSetup';
import { sparkData } from '../utils/sparkline';
import type { Dataset } from './dataset';
import { HIST_DAYS, INITIAL_BUDGET, INITIAL_PATTERN, TIMELINE_BUDGET_SPEND, TIMELINE_DOW, TIMELINE_PATTERN_SPEND } from './anomalies';

function patternSeriesFor(a: PatternAnomaly): number[] {
  const weeklyBump = a.weeklyBumpDow !== undefined ? { [a.weeklyBumpDow]: a.weeklyBumpAmount ?? 0 } : undefined;
  return sparkData(a.base, a.spike / a.base, a.ago, a.seed, { dow: TIMELINE_DOW, weeklyBump });
}

export const SAMPLE_DATASET: Dataset = {
  id: 'sample',
  label: 'Sample',
  budget: INITIAL_BUDGET,
  pattern: INITIAL_PATTERN,
  labels: getLastNDates(HIST_DAYS),
  dow: TIMELINE_DOW,
  budgetSpend: TIMELINE_BUDGET_SPEND,
  patternSpend: TIMELINE_PATTERN_SPEND,
  patternSeriesFor,
  monthSource: null,
  channelNotes: {},
};
