/**
 * Noble career — Basic Character Generation.
 *
 * Special rules:
 *   - Enlistment is automatic, but only if Soc 10+. We model this with a
 *     custom restriction (Soc 10+) and a "target 2" (auto-success) on the
 *     enlistment roll. The restriction is checked against the *character*,
 *     not the homeworld, so for now we use a homeworld restriction with the
 *     unrelated Pre-Stellar+ filter (per book) and let enlistment effectively
 *     always succeed by setting target = 2. The Soc 10+ requirement is
 *     enforced at the chooseCareer level by a small chargen check (added in
 *     the engine).
 *   - Noble bypasses homeworld-tech-level limits on skills (bypassesHomeworldSkillLimits=true).
 *   - Noble survival DM under anagathics is -2 (society frowns on it).
 */

import type { CareerDef } from "../../engine/types";

export const NOBLE: CareerDef = {
  id: "Noble",
  name: "Noble",
  enlistmentRestrictions: [
    {
      description: "Homeworld must be Pre-Stellar or higher (tech 7+) AND character must be Soc 10+",
      matches: (h) => h.techLevel >= 7,
    },
  ],
  thresholds: {
    // Effectively auto-enlist for Soc 10+ characters; the Soc 10+ gating is
    // also done at chooseCareer time (the engine excludes Noble from offered
    // careers if Soc < 10). target 2 means any 2D roll passes.
    enlistment: { target: 2, dms: [] },
    survival: {
      target: 4,
      dms: [],
    },
    commission: {
      // "Position" in book; we reuse commission machinery.
      target: 5,
      dms: [{ value: 1, condition: { stat: "Edu", op: ">=", n: 9 } }],
    },
    promotion: {
      target: 12,
      dms: [{ value: 1, condition: { stat: "Int", op: ">=", n: 10 } }],
    },
    specialDuty: { target: 6, dms: [] },
    reenlist: { target: 4, dms: [] },
  },
  ranks: ["B Knight", "C Baron", "D Marquis", "E Count", "F Duke"],
  acquiredSkillTables: [
    {
      id: "personalDevelopment",
      name: "Personal Development",
      entries: [
        { roll: 1, skillId: "Physical" },
        { roll: 2, skillId: "Dex", statBump: "Dex" },
        { roll: 3, skillId: "End", statBump: "End" },
        { roll: 4, skillId: "Mental" },
        { roll: 5, skillId: "Vice" },
        { roll: 6, skillId: "HandCombat" },
      ],
    },
    {
      id: "serviceSkills",
      name: "Service Skills",
      entries: [
        { roll: 1, skillId: "GunCombat" },
        { roll: 2, skillId: "HandCombat" },
        { roll: 3, skillId: "Environ" },
        { roll: 4, skillId: "Vehicle" },
        { roll: 5, skillId: "Vice" },
        { roll: 6, skillId: "Dex", statBump: "Dex" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "Space" },
        { roll: 2, skillId: "ShipsBoat" },
        { roll: 3, skillId: "Vehicle" },
        { roll: 4, skillId: "Navigation" },
        { roll: 5, skillId: "SpaceTech" },
        { roll: 6, skillId: "Leader" },
      ],
    },
    {
      id: "advancedEducation8plus",
      name: "Advanced Education (Edu 8+)",
      minEdu: 8,
      entries: [
        { roll: 1, skillId: "Science" },
        { roll: 2, skillId: "Technical" },
        { roll: 3, skillId: "Academic" },
        { roll: 4, skillId: "Interpersonal" },
        { roll: 5, skillId: "Inborn" },
        { roll: 6, skillId: "Inborn" },
      ],
    },
  ],
  musteringOut: {
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "highPassage" } },
      { roll: 3, benefit: { kind: "none" } },
      { roll: 4, benefit: { kind: "weapon" } },
      { roll: 5, benefit: { kind: "tasMembership" } },
      { roll: 6, benefit: { kind: "object", objectId: "yacht" } },
      { roll: 7, benefit: { kind: "none" } },
    ],
    cash: [
      { roll: 1, credits: 10000 },
      { roll: 2, credits: 10000 },
      { roll: 3, credits: 50000 },
      { roll: 4, credits: 50000 },
      { roll: 5, credits: 100000 },
      { roll: 6, credits: 100000 },
      { roll: 7, credits: 200000 },
    ],
  },
  skillsPerInitialTerm: 2,
  skillsPerSubsequentTerm: 1,
  canRetire: true,
  bypassesHomeworldSkillLimits: true,
  anagathicsSurvivalDm: -2,
};
