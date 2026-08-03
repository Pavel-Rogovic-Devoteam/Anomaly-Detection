import type { Provider } from '../types';

export function eur(n: number): string {
  return '€' + n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function eurRounded(n: number): string {
  return '€' + Math.round(n).toLocaleString('de-DE');
}

export function detectedText(ago: number): string {
  if (ago === 0) return 'Today';
  if (ago === 1) return 'Yesterday';
  return `${ago}d ago`;
}

export const PROVIDER_LABELS: Record<Provider, string> = { aws: 'AWS', azure: 'Azure', gcp: 'GCP' };
export const PROVIDER_COLORS: Record<Provider, string> = { aws: '#ff9900', azure: '#00a1f1', gcp: '#34a853' };

export function alertPillClass(pct: number): 'danger' | 'warning' | 'ok' {
  if (pct >= 150) return 'danger';
  if (pct >= 110) return 'warning';
  return 'ok';
}

export function daySuffix(day: number): string {
  if (day % 10 === 1 && day % 100 !== 11) return 'st';
  if (day % 10 === 2 && day % 100 !== 12) return 'nd';
  if (day % 10 === 3 && day % 100 !== 13) return 'rd';
  return 'th';
}
