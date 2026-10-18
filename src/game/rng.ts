/* eslint-disable no-bitwise -- bitwise ops are inherent to the mulberry32 PRNG */
/**
 * Deterministic seeded PRNG (mulberry32) so games are reproducible from a
 * seed (useful for tests and potentially a "daily codenames" mode later).
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Inclusive integer in [0, max) using the provided RNG. */
export function randInt(rng: () => number, max: number): number {
  return Math.floor(rng() * max);
}

export function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
