/**
 * Scout career — Basic Character Generation.
 *
 * Scouts have no commission, no promotion, no ranks. Two skills per term
 * (initial and subsequent). Cannot retire. Subject to homeworld skill
 * limits like any non-Noble career.
 *
 * Enlistment 7+ (DM +1 Int 6+, DM +2 Str 8+)
 * Survival 7+ (DM +2 End 9+)
 * Special Duty 4+
 * Reenlist 3+
 */

import type { CareerDef } from "../../engine/types";

export const SCOUTS: CareerDef = {
  id: "Scouts",
  name: "Scouts",
  enlistmentRestrictions: [
    {
      description: "Homeworld must be Early Stellar or higher (tech 9+)",
      matches: (h) => h.techLevel >= 9,
    },
  ],
  thresholds: {
    enlistment: {
      target: 7,
      dms: [
        { value: 1, condition: { stat: "Int", op: ">=", n: 6 } },
        { value: 2, condition: { stat: "Str", op: ">=", n: 8 } },
      ],
    },
    survival: {
      target: 7,
      dms: [{ value: 2, condition: { stat: "End", op: ">=", n: 9 } }],
    },
    commission: null,
    promotion: null,
    specialDuty: { target: 4, dms: [] },
    reenlist: { target: 3, dms: [] },
  },
  ranks: [],
  acquiredSkillTables: [
    {
      id: "personalDevelopment",
      name: "Personal Development",
      entries: [
        { roll: 1, skillId: "Physical" },
        { roll: 2, skillId: "Dex", statBump: "Dex" },
        { roll: 3, skillId: "End", statBump: "End" },
        { roll: 4, skillId: "Vice" },
        { roll: 5, skillId: "Mental" },
        { roll: 6, skillId: "GunCombat" },
      ],
    },
    {
      id: "serviceSkills",
      name: "Service Skills",
      entries: [
        { roll: 1, skillId: "Survival" },
        { roll: 2, skillId: "VaccSuit" },
        { roll: 3, skillId: "Mechanical" },
        { roll: 4, skillId: "Space" },
        { roll: 5, skillId: "Electronics" },
        { roll: 6, skillId: "Inborn" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "Vehicle" },
        { roll: 2, skillId: "Survey" },
        { roll: 3, skillId: "Electronics" },
        { roll: 4, skillId: "Inborn" },
        { roll: 5, skillId: "SpecialCombat" },
        { roll: 6, skillId: "Medical" },
      ],
    },
    {
      id: "advancedEducation8plus",
      name: "Advanced Education (Edu 8+)",
      minEdu: 8,
      entries: [
        { roll: 1, skillId: "Medical" },
        { roll: 2, skillId: "Space" },
        { roll: 3, skillId: "SpaceTech" },
        { roll: 4, skillId: "Technical" },
        { roll: 5, skillId: "Inborn" },
        { roll: 6, skillId: "Interpersonal" },
      ],
    },
  ],
  musteringOut: {
    // Scout Mustering Out — Benefits and Cash tables.
    // Both tables have 7 entries: roll 1-6 base, 7 reached only when the
    // character has rank 5/6 (+1 benefit DM) or +1 cash DM (Gambling/retired).
    // Scouts have no rank, so they never reach 7 on benefits; they can still
    // reach 7 on cash if they have Gambling-1+.
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "statBump", stat: "Int", amount: 2 } },
      { roll: 3, benefit: { kind: "statBump", stat: "Edu", amount: 2 } },
      { roll: 4, benefit: { kind: "weapon" } },
      { roll: 5, benefit: { kind: "weapon" } },
      { roll: 6, benefit: { kind: "object", objectId: "scoutShip" } },
      { roll: 7, benefit: { kind: "none" } },
    ],
    cash: [
      { roll: 1, credits: 20000 },
      { roll: 2, credits: 20000 },
      { roll: 3, credits: 30000 },
      { roll: 4, credits: 30000 },
      { roll: 5, credits: 50000 },
      { roll: 6, credits: 50000 },
      { roll: 7, credits: 50000 },
    ],
  },
  skillsPerInitialTerm: 2,
  skillsPerSubsequentTerm: 2, // Scouts get 2 per term (note in the book)
  canRetire: false,
  bypassesHomeworldSkillLimits: false,
  anagathicsSurvivalDm: -1,
  draftSlot: 4,
};
