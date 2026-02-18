/**
 * Mulberry32 PRNG - Deterministic pseudo-random number generator
 * Used for consistent particle placement across page loads
 */

export function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a seeded random number between min and max
 */
export function seededRandom(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

/**
 * Generate a seeded random integer between min and max (inclusive)
 */
export function seededRandomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(seededRandom(rng, min, max + 1));
}

/**
 * Pick a random element from an array using seeded RNG
 */
export function seededPick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
