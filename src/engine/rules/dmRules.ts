/**
 * Apply a list of DMRules against a character's UPP, returning total DM.
 */

import type { Character, DMRule } from "../types";

export function evaluateDMs(rules: readonly DMRule[], character: Character): number {
  let total = 0;
  for (const rule of rules) {
    const { stat, op, n } = rule.condition;
    const value = character.upp[stat];
    const passes = op === ">=" ? value >= n : value <= n;
    if (passes) total += rule.value;
  }
  return total;
}
