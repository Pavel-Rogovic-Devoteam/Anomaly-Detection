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
}

export type SeverityFilter = 'all' | Severity;

export type DistView = 'provider' | 'service';

export type TimelineView = 'all' | 'budget' | 'pattern';

export type NavSectionKey = 'inventory' | 'economics' | 'compliance';

export type Theme = 'light' | 'dark';
