import type { PeriodOption } from '../types';

export interface CustomRange {
  start: string;
  end: string;
}

function monthLong(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function monthShort(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - n);
  return d;
}

export const PERIOD_LABELS: Record<Exclude<PeriodOption, 'custom'>, string> = {
  'current-month': 'Current month',
  'last-month': 'Last month',
  'last-3-months': 'Last 3 months',
  'last-6-months': 'Last 6 months',
};

export function getPeriodButtonLabel(period: PeriodOption, customRange: CustomRange | null): string {
  switch (period) {
    case 'current-month':
      return monthLong(new Date());
    case 'last-month':
      return monthLong(monthsAgo(1));
    case 'last-3-months':
      return `${monthShort(monthsAgo(2))} – ${monthLong(new Date())}`;
    case 'last-6-months':
      return `${monthShort(monthsAgo(5))} – ${monthLong(new Date())}`;
    case 'custom':
      return customRange ? `${customRange.start} – ${customRange.end}` : 'Custom period';
  }
}
