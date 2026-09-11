import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
} from 'chart.js';
import type { Theme } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip);

/** Demo "today" — every historical series (up to 6 months back) is anchored to this fixed date,
 * so day-of-week assignments stay deterministic regardless of when the app is actually run. */
export const DEMO_ANCHOR = '2026-05-07';

export function getLastNDates(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(DEMO_ANCHOR);
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  });
}

/** Day-of-week (0=Sun..6=Sat) for each of the last `n` days ending on DEMO_ANCHOR, aligned index-for-index with getLastNDates(n). */
export function getDowForLastN(n: number): number[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(DEMO_ANCHOR);
    d.setDate(d.getDate() - (n - 1 - i));
    return d.getDay();
  });
}

/** Canvas-rendered chart colors can't read CSS variables, so they're mirrored here per theme. */
const CHART_PALETTE: Record<Theme, { surface2: string; border2: string; text: string; textMuted: string; grid: string }> = {
  dark: {
    surface2: '#111428',
    border2: '#1f2448',
    text: '#e8eafc',
    textMuted: '#6272a0',
    grid: 'rgba(22,25,58,0.9)',
  },
  light: {
    surface2: '#ffffff',
    border2: '#d7dae8',
    text: '#1c1f33',
    textMuted: '#6b7093',
    grid: 'rgba(226,228,240,0.9)',
  },
};

export function getChartPalette(theme: Theme) {
  return CHART_PALETTE[theme];
}

export function getTooltipStyle(theme: Theme) {
  const p = CHART_PALETTE[theme];
  return {
    backgroundColor: p.surface2,
    borderColor: p.border2,
    borderWidth: 1,
    titleColor: p.text,
    bodyColor: p.textMuted,
    padding: 10,
    cornerRadius: 6,
  };
}
