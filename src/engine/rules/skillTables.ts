/**
 * Helpers for working with acquired-skill tables.
 */

import type { Character, CareerDef, SkillTableId } from "../types";

/**
 * Which skill tables can the character currently roll on? Filters out the
 * Edu-8+ table if the character's Edu is below the threshold.
 */
export function eligibleSkillTables(
  career: CareerDef,
  character: Character,
): SkillTableId[] {
  return career.acquiredSkillTables
    .filter((t) => t.minEdu === undefined || character.upp.Edu >= t.minEdu)
    .map((t) => t.id);
}

export function getSkillTable(career: CareerDef, id: SkillTableId) {
  const t = career.acquiredSkillTables.find((x) => x.id === id);
  if (!t) throw new Error(`Career ${career.id} has no skill table ${id}`);
  return t;
}
