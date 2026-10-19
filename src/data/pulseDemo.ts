import type { BudgetAnomaly, PatternAnomaly, Provider, Severity } from '../types';
import { getSeasonalOutlierDirectionAt } from '../utils/iqr';
import type { Dataset } from './dataset';
import snapshotJson from './pulseDemoSnapshot.json';

interface SnapshotBudget {
  id: string;
  name: string;
  provider: string;
  scope: 'service' | 'subscription';
  scopeLabel: string;
  limit: number;
  native: boolean;
  thresholds: number[];
  mtd: number;
  breachDate: string | null;
}

interface Snapshot {
  dates: string[];
  orgDaily: number[];
  budgetedDaily: number[];
  services: { provider: string; name: string; daily: number[] }[];
  budgets: SnapshotBudget[];
}

const snap = snapshotJson as unknown as Snapshot;

const PROVIDERS: Record<string, Provider> = { AWS: 'aws', Azure: 'azure', Google: 'gcp' };

/** A day only counts if the service spends at least this share of the org's median daily spend (materiality gate). */
const MATERIALITY_SHARE = 0.02;

/** The most recent flagged day per service is looked for within this many trailing days. */
const DETECTION_WINDOW_DAYS = 90;

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function patternSeverity(devPct: number): Severity {
  if (devPct > 250) return 'critical';
  if (devPct > 150) return 'high';
  if (devPct > 120) return 'medium';
  return 'low';
}

function budgetSeverity(healthPct: number): Severity {
  if (healthPct > 150) return 'critical';
  if (healthPct > 125) return 'high';
  if (healthPct > 110) return 'medium';
  return 'low';
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

const { dates } = snap;
const n = dates.length;
const lastDate = dates[n - 1];
const dow = dates.map((d) => new Date(`${d}T00:00:00Z`).getUTCDay());
const labels = dates.map((d) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }),
);

const materialityFloor = MATERIALITY_SHARE * median(snap.orgDaily);

const seriesById = new Map<string, number[]>();

function buildPatternRows(): PatternAnomaly[] {
  const rows: PatternAnomaly[] = [];
  for (const service of snap.services) {
    let flaggedIdx = -1;
    for (let i = n - 1; i >= n - DETECTION_WINDOW_DAYS; i--) {
      if (service.daily[i] < materialityFloor) continue;
      if (getSeasonalOutlierDirectionAt(service.daily, dow, i) === 'high') {
        flaggedIdx = i;
        break;
      }
    }
    if (flaggedIdx < 0) continue;

    const base = median(service.daily.filter((v, i) => i !== flaggedIdx && v > 0));
    if (base <= 0) continue;
    const spike = service.daily[flaggedIdx];
    const dev = Math.round(((spike - base) / base) * 100);
    const id = `PP-${PROVIDERS[service.provider]}-${slug(service.name)}`;
    seriesById.set(id, service.daily);
    rows.push({
      id,
      svc: service.name,
      acct: 'All subscriptions',
      prov: PROVIDERS[service.provider],
      region: 'Org-wide',
      base: Math.round(base * 100) / 100,
      spike,
      dev,
      sev: patternSeverity(dev),
      stat: 'active',
      ago: n - 1 - flaggedIdx,
      seed: 0,
    });
  }
  return rows.sort((a, b) => a.ago - b.ago);
}

function buildBudgetRows(): BudgetAnomaly[] {
  return snap.budgets
    .filter((b) => b.mtd >= b.limit && b.breachDate !== null)
    .map((b) => ({
      id: `PB-${b.id.slice(0, 8)}`,
      svc: b.name,
      acct: b.scope === 'service' ? `All subscriptions · ${b.scopeLabel}` : b.scopeLabel,
      prov: PROVIDERS[b.provider],
      region: `${b.native ? 'Cloud-native' : 'Pulse'} budget · ${b.scope} scope`,
      cur: b.mtd,
      bud: b.limit,
      sev: budgetSeverity((b.mtd / b.limit) * 100),
      stat: 'active' as const,
      ago: daysBetween(b.breachDate as string, lastDate),
      serviceName: b.scope === 'service' ? b.scopeLabel : undefined,
    }))
    .sort((a, b) => a.ago - b.ago);
}

export const PULSE_DEMO_DATASET: Dataset = {
  id: 'pulse-demo',
  label: 'Pulse Demo',
  budget: buildBudgetRows(),
  pattern: buildPatternRows(),
  labels,
  dow,
  budgetSpend: snap.budgetedDaily,
  patternSpend: snap.orgDaily,
  patternSeriesFor: (a) => seriesById.get(a.id) ?? [],
  monthSource: { dates, budget: snap.budgetedDaily, pattern: snap.orgDaily },
  channelNotes: { budget: 'budgeted subscriptions', pattern: 'org-wide, all services' },
};
