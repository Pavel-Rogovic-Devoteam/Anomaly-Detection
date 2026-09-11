export const SPARK_HISTORY_DAYS = 180;

/**
 * Seeded pseudo-random `length`-day series with a single spike injected at `spikeDayFromEnd`.
 * `weeklyBump` optionally adds a fixed €/day amount on specific weekdays (via `dow`, aligned
 * index-for-index with the generated series) — e.g. a routine Monday batch job — so seasonal
 * detection has a real weekly pattern to learn as "normal" for that weekday.
 */
export function sparkData(
  base: number,
  spikeMult: number,
  spikeDayFromEnd: number,
  seed: number,
  options?: { length?: number; dow?: number[]; weeklyBump?: Partial<Record<number, number>> },
): number[] {
  const length = options?.length ?? SPARK_HISTORY_DAYS;
  const { dow, weeklyBump } = options ?? {};
  let s = seed * 9301 + 49297;
  const spikeIdx = length - 1 - spikeDayFromEnd;
  return Array.from({ length }, (_, i) => {
    s = (s * 9301 + 49297) % 233280;
    const noise = (s / 233280 - 0.5) * 0.35;
    if (i === spikeIdx) return base * spikeMult;
    const bump = dow && weeklyBump ? (weeklyBump[dow[i]] ?? 0) : 0;
    return base * (1 + noise) + bump;
  });
}
