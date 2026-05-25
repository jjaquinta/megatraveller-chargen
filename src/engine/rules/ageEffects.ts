/**
 * Aging Table from MegaTraveller (Players' Manual).
 *
 * Aging effects are determined by *apparent age* (the line of the Aging
 * Table), not actual age. Characters not on anagathics have apparentAge ==
 * actualAge. Characters who have used anagathics may have apparentAge
 * frozen below actualAge.
 *
 * Each row gives the (loss, savingThrow) pair per characteristic. A roll of
 * 2D >= savingThrow avoids the loss.
 *
 * Age 66+ is the perpetual top line — apparent age >= 66 always uses it,
 * including the Int saving throw.
 */

import type { CharacteristicName } from "../types";

export interface AgingEffect {
  stat: CharacteristicName;
  loss: number;
  savingThrow: number; // 2D >= this avoids the loss
}

interface AgingRow {
  apparentAgeAtLeast: number;
  effects: AgingEffect[];
}

const AGING_TABLE: AgingRow[] = [
  {
    apparentAgeAtLeast: 34,
    effects: [
      { stat: "Str", loss: 1, savingThrow: 8 },
      { stat: "Dex", loss: 1, savingThrow: 7 },
      { stat: "End", loss: 1, savingThrow: 8 },
    ],
  },
  {
    apparentAgeAtLeast: 38,
    effects: [
      { stat: "Str", loss: 1, savingThrow: 8 },
      { stat: "Dex", loss: 1, savingThrow: 7 },
      { stat: "End", loss: 1, savingThrow: 8 },
    ],
  },
  {
    apparentAgeAtLeast: 42,
    effects: [
      { stat: "Str", loss: 1, savingThrow: 8 },
      { stat: "Dex", loss: 1, savingThrow: 7 },
      { stat: "End", loss: 1, savingThrow: 8 },
    ],
  },
  {
    apparentAgeAtLeast: 46,
    effects: [
      { stat: "Str", loss: 1, savingThrow: 8 },
      { stat: "Dex", loss: 1, savingThrow: 7 },
      { stat: "End", loss: 1, savingThrow: 8 },
    ],
  },
  {
    apparentAgeAtLeast: 50,
    effects: [
      { stat: "Str", loss: 1, savingThrow: 9 },
      { stat: "Dex", loss: 1, savingThrow: 8 },
      { stat: "End", loss: 1, savingThrow: 9 },
    ],
  },
  {
    apparentAgeAtLeast: 54,
    effects: [
      { stat: "Str", loss: 1, savingThrow: 9 },
      { stat: "Dex", loss: 1, savingThrow: 9 },
      { stat: "End", loss: 1, savingThrow: 9 },
    ],
  },
  {
    apparentAgeAtLeast: 58,
    effects: [
      { stat: "Str", loss: 1, savingThrow: 9 },
      { stat: "Dex", loss: 1, savingThrow: 8 },
      { stat: "End", loss: 1, savingThrow: 9 },
    ],
  },
  {
    apparentAgeAtLeast: 62,
    effects: [
      { stat: "Str", loss: 1, savingThrow: 9 },
      { stat: "Dex", loss: 1, savingThrow: 8 },
      { stat: "End", loss: 1, savingThrow: 9 },
    ],
  },
  {
    apparentAgeAtLeast: 66,
    effects: [
      { stat: "Str", loss: 2, savingThrow: 9 },
      { stat: "Dex", loss: 2, savingThrow: 9 },
      { stat: "End", loss: 2, savingThrow: 9 },
      { stat: "Int", loss: 1, savingThrow: 9 },
    ],
  },
];

/**
 * Returns the aging effects for the given apparent age, or null if too young
 * to age (apparent age < 34).
 */
export function agingEffectsFor(apparentAge: number): AgingEffect[] | null {
  // Find the highest-bracket row whose threshold is <= apparentAge.
  let row: AgingRow | null = null;
  for (const r of AGING_TABLE) {
    if (apparentAge >= r.apparentAgeAtLeast) {
      row = r;
    }
  }
  return row?.effects ?? null;
}
