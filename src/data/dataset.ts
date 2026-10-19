import type { BudgetAnomaly, PatternAnomaly } from '../types';

export type DatasetId = 'sample' | 'pulse-demo';

/** Real per-day values used to build the "current month" view from actual dates. */
export interface MonthSource {
  dates: string[];
  budget: number[];
  pattern: number[];
}

/** Everything the page renders, so the synthetic sample and a real snapshot are interchangeable. */
export interface Dataset {
  id: DatasetId;
  label: string;
  budget: BudgetAnomaly[];
  pattern: PatternAnomaly[];
  /** 'dd Mon' label per day, aligned index-for-index with every series below; last entry = most recent day. */
  labels: string[];
  /** Day of week (0=Sun..6=Sat) per day, same alignment. */
  dow: number[];
  budgetSpend: number[];
  patternSpend: number[];
  /** Full-history daily series for a Pattern row, aligned with `dow`. */
  patternSeriesFor: (anomaly: PatternAnomaly) => number[];
  /** null = the sample's cyclic stand-in for an in-progress month. */
  monthSource: MonthSource | null;
  /** Short qualifier appended to each chart's subtitle, e.g. what the channel series aggregates. */
  channelNotes: { budget?: string; pattern?: string };
}
