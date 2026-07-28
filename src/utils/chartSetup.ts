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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip);

export function getLast30Dates(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date('2026-05-07');
    d.setDate(d.getDate() - (29 - i));
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  });
}

export const TOOLTIP_STYLE = {
  backgroundColor: '#111428',
  borderColor: '#1f2448',
  borderWidth: 1,
  titleColor: '#e8eafc',
  bodyColor: '#8b96be',
  padding: 10,
  cornerRadius: 6,
};
