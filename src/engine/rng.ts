/**
 * Seedable pseudo-random number generator (mulberry32).
 *
 * Properties: 32-bit state, period ~2^32, decent statistical quality for
 * non-cryptographic purposes (which dice are). Plenty for character
 * generation; reproducible from a string seed so bug reports can be replayed.
 */

export interface RNG {
  /** Returns a float in [0, 1). */
  next(): number;
  /** The seed string the RNG was constructed with (for storage on the character). */
  readonly seed: string;
}

/**
 * Hash a string into a 32-bit integer (FNV-1a variant). Used to convert a
 * human-friendly seed string into a numeric state for mulberry32.
 */
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Construct a seeded RNG.
 *
 * @param seed - Either a string (hashed) or a number (used directly as state).
 */
export function createRng(seed: string | number): RNG {
  const seedString = typeof seed === "string" ? seed : String(seed);
  let state = typeof seed === "number" ? seed >>> 0 : hashSeed(seedString);

  return {
    seed: seedString,
    next(): number {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}

/**
 * Create an RNG seeded from a fresh entropy source. Uses crypto when
 * available, falls back to Date.now() (used only in pathological non-browser
 * environments — vitest under jsdom has crypto).
 */
export function createRandomRng(): RNG {
  const buf = new Uint32Array(2);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(buf);
  } else {
    buf[0] = (Date.now() & 0xffffffff) >>> 0;
    buf[1] = (Math.floor(Math.random() * 0xffffffff) & 0xffffffff) >>> 0;
  }
  // Concatenate the two halves into a printable hex seed string.
  const seedString =
    (buf[0] ?? 0).toString(16).padStart(8, "0") + (buf[1] ?? 0).toString(16).padStart(8, "0");
  return createRng(seedString);
}
