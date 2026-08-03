export interface IQRBounds {
  q1: number;
  q3: number;
  iqr: number;
  upperBound: number;
}

/** Linear-interpolation quantile (same convention as numpy's default). `sorted` must be ascending. */
function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined ? sorted[base] + rest * (sorted[base + 1] - sorted[base]) : sorted[base];
}

/**
 * IQR = Q3 - Q1; Upper Bound = Q3 + 1.5*IQR. Percentile-based, so it stays
 * meaningful for skewed, non-normal cost distributions where a mean/stdev
 * z-score would be thrown off by the very spikes it's trying to catch.
 */
export function computeIQRBounds(values: number[]): IQRBounds {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  return { q1, q3, iqr, upperBound: q3 + 1.5 * iqr };
}

export function isIQROutlier(value: number, bounds: IQRBounds): boolean {
  return value > bounds.upperBound;
}
