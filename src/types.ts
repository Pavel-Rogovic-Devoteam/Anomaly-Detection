export type Provider = 'aws' | 'azure' | 'gcp';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type AnomalyStatus = 'active' | 'investigating' | 'resolved';

export interface BudgetAnomaly {
  id: string;
  svc: string;
  acct: string;
  prov: Provider;
  region: string;
  cur: number;
  bud: number;
  sev: Severity;
  stat: AnomalyStatus;
  ago: number;
}

export interface PatternAnomaly {
  id: string;
  svc: string;
  acct: string;
  prov: Provider;
  region: string;
  base: number;
  spike: number;
  dev: number;
  sev: Severity;
  stat: AnomalyStatus;
  ago: number;
  seed: number;
  /** A weekday (0=Sun..6=Sat) this service routinely costs more on — e.g. a weekly batch job —
   *  so seasonal (day-of-week) detection treats that day's elevated spend as normal rather than
   *  flagging it. Only set for demo rows illustrating the behavior; omit for flat, non-seasonal series. */
  weeklyBumpDow?: number;
  /** €/day added on weeklyBumpDow. Ignored unless weeklyBumpDow is set. */
  weeklyBumpAmount?: number;
}

export type SeverityFilter = 'all' | Severity;

export type ProviderFilter = 'all' | Provider;

export type DistView = 'provider' | 'service';

export type NavSectionKey = 'inventory' | 'economics' | 'compliance';

export type Theme = 'light' | 'dark';

export type PeriodOption = 'current-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'custom';
