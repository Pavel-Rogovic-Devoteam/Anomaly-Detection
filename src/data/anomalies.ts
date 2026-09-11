import type { BudgetAnomaly, PatternAnomaly, Severity } from '../types';
import { getDowForLastN } from '../utils/chartSetup';

export const INITIAL_BUDGET: BudgetAnomaly[] = [
  { id: 'BA-001', svc: 'EC2 Production Cluster', acct: '371752561166', prov: 'aws', region: 'us-east-1', cur: 4231, bud: 3500, sev: 'critical', stat: 'active', ago: 2 },
  { id: 'BA-002', svc: 'BigQuery Analytics', acct: 'cmp-analytics', prov: 'gcp', region: 'EU', cur: 2841, bud: 2000, sev: 'critical', stat: 'active', ago: 1 },
  { id: 'BA-003', svc: 'AKS Dev Environment', acct: 'dev-sub-westeu', prov: 'azure', region: 'West Europe', cur: 1205, bud: 800, sev: 'high', stat: 'investigating', ago: 3 },
  { id: 'BA-004', svc: 'RDS Database Cluster', acct: '371752561166', prov: 'aws', region: 'eu-west-1', cur: 892, bud: 750, sev: 'medium', stat: 'investigating', ago: 5 },
  { id: 'BA-005', svc: 'Azure VM Scale Sets', acct: 'prod-sub-noreu', prov: 'azure', region: 'North Europe', cur: 678, bud: 600, sev: 'low', stat: 'active', ago: 6 },
  { id: 'BA-006', svc: 'Cloud Storage Egress', acct: 'cmp-staging', prov: 'gcp', region: 'Global', cur: 445, bud: 400, sev: 'low', stat: 'resolved', ago: 8 },
];

export const INITIAL_PATTERN: PatternAnomaly[] = [
  { id: 'PA-001', svc: 'SageMaker Training Jobs', acct: '371752561166', prov: 'aws', region: 'us-east-1', base: 89, spike: 462, dev: 419, sev: 'critical', stat: 'active', ago: 0, seed: 7 },
  { id: 'PA-002', svc: 'Lambda + API Gateway', acct: '371752561166', prov: 'aws', region: 'eu-west-1', base: 45, spike: 198, dev: 340, sev: 'critical', stat: 'active', ago: 2, seed: 4 },
  { id: 'PA-003', svc: 'Azure Cognitive Services', acct: 'ml-sub-westeu', prov: 'azure', region: 'West Europe', base: 23, spike: 90, dev: 291, sev: 'critical', stat: 'investigating', ago: 1, seed: 2 },
  { id: 'PA-004', svc: 'Compute Engine – ML Nodes', acct: 'cmp-analytics', prov: 'gcp', region: 'us-central1', base: 120, spike: 342, dev: 185, sev: 'high', stat: 'active', ago: 5, seed: 9 },
  { id: 'PA-005', svc: 'S3 Data Transfer Out', acct: '371752561166', prov: 'aws', region: 'us-east-1', base: 67, spike: 171, dev: 155, sev: 'high', stat: 'investigating', ago: 3, seed: 1 },
  { id: 'PA-006', svc: 'Azure Blob Storage', acct: 'prod-sub-noreu', prov: 'azure', region: 'North Europe', base: 34, spike: 82, dev: 141, sev: 'medium', stat: 'active', ago: 4, seed: 6 },
  { id: 'PA-007', svc: 'Cloud Run Services', acct: 'cmp-prod', prov: 'gcp', region: 'EU', base: 18, spike: 43, dev: 139, sev: 'medium', stat: 'resolved', ago: 6, seed: 3 },
  { id: 'PA-008', svc: 'CloudFront Distribution', acct: '703134557218', prov: 'aws', region: 'Global', base: 55, spike: 121, dev: 120, sev: 'medium', stat: 'active', ago: 7, seed: 8 },
  { id: 'PA-009', svc: 'GCP Pub/Sub', acct: 'cmp-analytics', prov: 'gcp', region: 'EU', base: 18, spike: 42, dev: 133, sev: 'medium', stat: 'resolved', ago: 7, seed: 5 },
  { id: 'PA-010', svc: 'Azure Container Registry', acct: 'dev-sub-westeu', prov: 'azure', region: 'West Europe', base: 12, spike: 25, dev: 108, sev: 'low', stat: 'resolved', ago: 9, seed: 0 },
  // Seasonal example: this service runs a weekly Monday ingestion batch (weeklyBumpDow: 1), so its
  // elevated Monday cost is normal and correctly NOT flagged — but the same magnitude of spend
  // showing up on a Wednesday (ago: 1, the most recent Wednesday) breaks its own weekday's much
  // lower pattern and IS flagged. See PatternTable's seasonal (day-of-week) IQR bounds.
  { id: 'PA-011', svc: 'BigQuery Data Ingestion', acct: 'cmp-data-eu', prov: 'gcp', region: 'EU', base: 42, spike: 168, dev: 300, sev: 'critical', stat: 'active', ago: 1, seed: 12, weeklyBumpDow: 1, weeklyBumpAmount: 130 },
];

export const SEV_RANK: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };

/** How far back the generated demo history reaches — enough for the "Last 6 months" period option. */
export const HIST_DAYS = 180;

/** Day-of-week (0=Sun..6=Sat) for every index of every HIST_DAYS-long series below, index HIST_DAYS-1 = today. */
export const TIMELINE_DOW: number[] = getDowForLastN(HIST_DAYS);

/** Daily cost impact for the most recent 30 days (index 29 = today, May 7 2026) — Budget = total overage (€), Pattern = total spike-above-baseline (€/day). Older history (the rest of the 6-month window) is quiet by default — see TIMELINE_PATTERN_SEASONAL below for the one deliberate recurring pattern. */
export const TIMELINE_BUDGET_COSTS = [0, 0, 142, 0, 45, 0, 78, 405, 0, 142, 0, 45, 0, 731, 78, 0, 1246, 0, 142, 78, 0, 873, 405, 45, 1572, 405, 776, 78, 1246, 1572];
// Monday entries (old-index 5, 12, 19, 26) are 0 here — their cost now comes from the uniform
// weekly seasonal bump below instead, so every Monday (not just these 4 recent ones) shows the
// same routine elevation.
export const TIMELINE_PATTERN_COSTS = [0, 13, 0, 24, 0, 0, 0, 0, 104, 0, 66, 0, 0, 0, 0, 67, 0, 104, 0, 0, 222, 0, 90, 90, 528, 153, 0, 479, 373, 1129];

/** Days where pattern spend dropped well below its usual baseline (€/day, negative) — e.g. a workload
 *  paused or scaled down. Budget-based anomalies only ever mean overspend, so this only applies to Pattern. */
export const TIMELINE_PATTERN_DIPS = [0, 0, 0, 0, 0, 0, 0, -225, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

/** A recurring weekly cost — e.g. a Monday batch ingestion job — applied to every Monday across the
 *  full 6-month history, not just the recent ones. This is what lets seasonal (day-of-week) detection
 *  learn "Monday is normally higher" instead of flagging every Monday as an anomaly relative to the
 *  rest of the week. */
const WEEKLY_MONDAY_BUMP = 140;
export const TIMELINE_PATTERN_SEASONAL: number[] = TIMELINE_DOW.map((d) => (d === 1 ? WEEKLY_MONDAY_BUMP : 0));

/** Deterministic seeded noise — same LCG technique as utils/sparkline.ts, so results stay stable across reloads. */
function seededSeries(seed: number, length: number, base: number, spread: number): number[] {
  let s = seed;
  return Array.from({ length }, () => {
    s = (s * 9301 + 49297) % 233280;
    return base + (s / 233280 - 0.5) * spread;
  });
}

function extendToHistDays(recentCosts: number[]): number[] {
  return new Array(HIST_DAYS - recentCosts.length).fill(0).concat(recentCosts);
}

const TIMELINE_BUDGET_COSTS_FULL = extendToHistDays(TIMELINE_BUDGET_COSTS);
const TIMELINE_PATTERN_COSTS_FULL = extendToHistDays(TIMELINE_PATTERN_COSTS);
const TIMELINE_PATTERN_DIPS_FULL = extendToHistDays(TIMELINE_PATTERN_DIPS);

/** Two separate spend channels, each with its own baseline — Budget and Pattern are independent detection
 *  mechanisms elsewhere in the app, and merging them into one series before computing IQR washed out
 *  pattern-driven spikes (smaller in absolute €) against budget-driven ones (larger in absolute €). Each
 *  channel gets its own IQR bounds computed from its own series, so a spike only needs to be large relative
 *  to its own channel's normal range, not to the combined total. */
const BUDGET_SPEND_BASELINE = seededSeries(11, HIST_DAYS, 620, 170);
const PATTERN_SPEND_BASELINE = seededSeries(23, HIST_DAYS, 340, 110);

/** HIST_DAYS-long (index HIST_DAYS-1 = today). Budget stays flat/non-seasonal by design — a budget has
 *  no notion of a "normal Monday" — Pattern bakes in the weekly seasonal bump above. */
export const TIMELINE_BUDGET_SPEND: number[] = BUDGET_SPEND_BASELINE.map((v, i) => Math.round(v + TIMELINE_BUDGET_COSTS_FULL[i]));
export const TIMELINE_PATTERN_SPEND: number[] = PATTERN_SPEND_BASELINE.map((v, i) =>
  Math.round(v + TIMELINE_PATTERN_COSTS_FULL[i] + TIMELINE_PATTERN_DIPS_FULL[i] + TIMELINE_PATTERN_SEASONAL[i]),
);

/** Just the most recent 30 days of each channel — buildCurrentMonthTimeline() cycles through these
 *  (not the full 6-month history) to extend an in-progress month into a forecast. */
export const TIMELINE_BUDGET_SPEND_RECENT30: number[] = TIMELINE_BUDGET_SPEND.slice(-30);
export const TIMELINE_PATTERN_SPEND_RECENT30: number[] = TIMELINE_PATTERN_SPEND.slice(-30);

const SERVICE_CATEGORY: Record<string, string> = {
  'EC2 Production Cluster': 'Compute',
  'AKS Dev Environment': 'Compute',
  'Azure VM Scale Sets': 'Compute',
  'Compute Engine – ML Nodes': 'Compute',
  'BigQuery Analytics': 'Database',
  'BigQuery Data Ingestion': 'Database',
  'RDS Database Cluster': 'Database',
  'Cloud Storage Egress': 'Storage',
  'S3 Data Transfer Out': 'Storage',
  'Azure Blob Storage': 'Storage',
  'Azure Container Registry': 'Storage',
  'SageMaker Training Jobs': 'AI / ML',
  'Azure Cognitive Services': 'AI / ML',
  'Lambda + API Gateway': 'Serverless',
  'Cloud Run Services': 'Serverless',
  'CloudFront Distribution': 'Networking',
  'GCP Pub/Sub': 'Networking',
};

export const SERVICE_CATEGORY_COLORS: Record<string, string> = {
  'Compute': '#6c6aff',
  'Storage': '#f59e0b',
  'Database': '#22d3ee',
  'AI / ML': '#8b5cf6',
  'Serverless': '#10b981',
  'Networking': '#f97316',
};

export function categoryFor(svc: string): string {
  return SERVICE_CATEGORY[svc] || 'Other';
}
