export interface IQRBounds {
  q1: number;
  q3: number;
  iqr: number;
  upperBound: number;
  lowerBound: number;
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
  return { q1, q3, iqr, upperBound: q3 + 1.5 * iqr, lowerBound: q1 - 1.5 * iqr };
}

/** Which side of the IQR band `value` breaches, if any. */
export function getOutlierDirection(value: number, bounds: IQRBounds): 'high' | 'low' | null {
  if (value > bounds.upperBound) return 'high';
  if (value < bounds.lowerBound) return 'low';
  return null;
}

/**
 * Bounds computed from `values` with the point at `excludeIndex` left out, so a single large
 * spike (or dip) can't inflate/skew the very quartiles it's about to be tested against —
 * otherwise a big enough spike raises Q3 (and IQR) enough to mask itself as "within range".
 */
export function computeIQRBoundsExcluding(values: number[], excludeIndex: number): IQRBounds {
  return computeIQRBounds(values.filter((_, i) => i !== excludeIndex));
}

/** Outlier direction for `values[index]`, tested leave-one-out against bounds computed from
 * every OTHER point in `values` rather than bounds it contributed to itself. */
export function getOutlierDirectionAt(values: number[], index: number): 'high' | 'low' | null {
  return getOutlierDirection(values[index], computeIQRBoundsExcluding(values, index));
}
