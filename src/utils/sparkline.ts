/** Seeded pseudo-random 30-day series with a single spike injected at `spikeDayFromEnd`. */
export function sparkData(base: number, spikeMult: number, spikeDayFromEnd: number, seed: number): number[] {
  let s = seed * 9301 + 49297;
  const spikeIdx = 29 - spikeDayFromEnd;
  return Array.from({ length: 30 }, (_, i) => {
    s = (s * 9301 + 49297) % 233280;
    const noise = (s / 233280 - 0.5) * 0.35;
    return i === spikeIdx ? base * spikeMult : base * (1 + noise);
  });
}
