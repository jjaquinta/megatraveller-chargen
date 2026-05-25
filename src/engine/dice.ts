/**
 * Dice helpers built on top of RNG.
 */

import type { RNG } from "./rng";

export interface DieRoll {
  faces: number[]; // individual die results, e.g. [3, 5] for 2D
  total: number; // sum
  dmsApplied: number; // total DMs added
  effective: number; // total + dmsApplied
}

export function roll1d(rng: RNG): number {
  return Math.floor(rng.next() * 6) + 1;
}

export function roll2d(rng: RNG, dms: number = 0): DieRoll {
  const a = roll1d(rng);
  const b = roll1d(rng);
  const total = a + b;
  return {
    faces: [a, b],
    total,
    dmsApplied: dms,
    effective: total + dms,
  };
}
