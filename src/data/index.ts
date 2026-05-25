/**
 * Loads and validates all data definitions.
 *
 * Called once at startup. Throws on inconsistency so typos in career data
 * surface immediately during development. Production builds rely on this
 * having passed at build time of the data files themselves.
 */

import type { CareerDef, CareerId } from "../engine/types";
import { SKILL_REGISTRY, allSkills } from "./skills";
import { SCOUTS } from "./careers/scouts";

const careers: CareerDef[] = [SCOUTS];

export const CAREER_REGISTRY: ReadonlyMap<CareerId, CareerDef> = new Map(
  careers.map((c) => [c.id, c]),
);

export function getCareer(id: CareerId): CareerDef {
  const c = CAREER_REGISTRY.get(id);
  if (!c) throw new Error(`Unknown career: ${id}`);
  return c;
}

export function allCareers(): readonly CareerDef[] {
  return careers;
}

/**
 * Validate consistency of the data files. Run at load time.
 * Throws on the first inconsistency with a descriptive message.
 */
export function validateData(): void {
  // Every skill referenced by a career's skill tables must exist.
  for (const career of careers) {
    for (const table of career.acquiredSkillTables) {
      for (const entry of table.entries) {
        if (!entry.statBump && !SKILL_REGISTRY.has(entry.skillId)) {
          throw new Error(
            `Career "${career.id}" table "${table.id}" references unknown skill "${entry.skillId}"`,
          );
        }
      }
    }
  }

  // Every cascade child must exist.
  for (const skill of allSkills()) {
    if (skill.isCascade && skill.cascadeOptions) {
      for (const child of skill.cascadeOptions) {
        if (!SKILL_REGISTRY.has(child)) {
          throw new Error(
            `Cascade skill "${skill.id}" references unknown child "${child}"`,
          );
        }
      }
    }
  }

  // Every career skill table should have 6 entries (1d6).
  for (const career of careers) {
    for (const table of career.acquiredSkillTables) {
      if (table.entries.length !== 6) {
        throw new Error(
          `Career "${career.id}" table "${table.id}" has ${table.entries.length} entries; expected 6`,
        );
      }
    }
    // Mustering-out tables should have 7 entries (1-6 base + 7 reachable by DMs).
    if (career.musteringOut.benefits.length !== 7) {
      throw new Error(
        `Career "${career.id}" benefits table has ${career.musteringOut.benefits.length} entries; expected 7`,
      );
    }
    if (career.musteringOut.cash.length !== 7) {
      throw new Error(
        `Career "${career.id}" cash table has ${career.musteringOut.cash.length} entries; expected 7`,
      );
    }
  }
}
