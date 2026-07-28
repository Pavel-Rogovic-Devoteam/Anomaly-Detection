import type { BudgetAnomaly, PatternAnomaly, Severity } from '../types';

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
];

export const SEV_RANK: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };

/** Anomaly-count-per-day series for the 30-day timeline (index 29 = today, May 7 2026). */
export const TIMELINE_BUDGET_COUNTS = [0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 2, 0, 1, 1, 0, 2, 1, 1, 2, 1, 2, 1, 2, 2];
export const TIMELINE_PATTERN_COUNTS = [0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 2, 1, 1, 2, 1, 3];

/** Cost impact parallel to the count series — Budget = total overage (€), Pattern = total spike-above-baseline (€/day). */
export const TIMELINE_BUDGET_COSTS = [0, 0, 142, 0, 45, 0, 78, 405, 0, 142, 0, 45, 0, 731, 78, 0, 1246, 0, 142, 78, 0, 873, 405, 45, 1572, 405, 776, 78, 1246, 1572];
export const TIMELINE_PATTERN_COSTS = [0, 13, 0, 24, 0, 66, 0, 0, 104, 0, 66, 0, 48, 0, 0, 67, 0, 104, 0, 153, 222, 0, 90, 90, 528, 153, 176, 479, 373, 1129];

const SERVICE_CATEGORY: Record<string, string> = {
  'EC2 Production Cluster': 'Compute',
  'AKS Dev Environment': 'Compute',
  'Azure VM Scale Sets': 'Compute',
  'Compute Engine – ML Nodes': 'Compute',
  'BigQuery Analytics': 'Database',
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
