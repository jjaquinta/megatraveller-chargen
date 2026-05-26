/**
 * Marines career — Basic Character Generation.
 */

import type { CareerDef } from "../../engine/types";

export const MARINES: CareerDef = {
  id: "Marines",
  name: "Marines",
  enlistmentRestrictions: [
    {
      description: "Homeworld must be Pre-Stellar or higher (tech 7+)",
      matches: (h) => h.techLevel >= 7,
    },
  ],
  thresholds: {
    enlistment: {
      target: 9,
      dms: [
        { value: 1, condition: { stat: "Int", op: ">=", n: 8 } },
        { value: 2, condition: { stat: "Str", op: ">=", n: 8 } },
      ],
    },
    survival: {
      target: 6,
      dms: [{ value: 2, condition: { stat: "End", op: ">=", n: 8 } }],
    },
    commission: {
      target: 9,
      dms: [{ value: 1, condition: { stat: "Edu", op: ">=", n: 7 } }],
    },
    promotion: {
      target: 9,
      dms: [{ value: 1, condition: { stat: "Soc", op: ">=", n: 8 } }],
    },
    specialDuty: { target: 4, dms: [] },
    reenlist: { target: 6, dms: [] },
  },
  ranks: ["Lieutenant", "Captain", "Force Cdr", "Lt Colonel", "Colonel", "Brigadier"],
  acquiredSkillTables: [
    {
      id: "personalDevelopment",
      name: "Personal Development",
      entries: [
        { roll: 1, skillId: "Physical" },
        { roll: 2, skillId: "Dex", statBump: "Dex" },
        { roll: 3, skillId: "Physical" },
        { roll: 4, skillId: "Vice" },
        { roll: 5, skillId: "HandCombat" },
        { roll: 6, skillId: "BladeCombat" },
      ],
    },
    {
      id: "serviceSkills",
      name: "Service Skills",
      entries: [
        { roll: 1, skillId: "ATV" },
        { roll: 2, skillId: "VaccSuit" },
        { roll: 3, skillId: "BladeCombat" },
        { roll: 4, skillId: "SpecialCombat" },
        { roll: 5, skillId: "HandCombat" },
        { roll: 6, skillId: "GunCombat" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "Vehicle" },
        { roll: 2, skillId: "Mechanical" },
        { roll: 3, skillId: "Electronics" },
        { roll: 4, skillId: "Tactics" },
        { roll: 5, skillId: "HandCombat" },
        { roll: 6, skillId: "SpecialCombat" },
      ],
    },
    {
      id: "advancedEducation8plus",
      name: "Advanced Education (Edu 8+)",
      minEdu: 8,
      entries: [
        { roll: 1, skillId: "Medical" },
        { roll: 2, skillId: "Tactics" },
        { roll: 3, skillId: "Tactics" },
        { roll: 4, skillId: "Technical" },
        { roll: 5, skillId: "Inborn" },
        { roll: 6, skillId: "Interpersonal" },
      ],
    },
  ],
  musteringOut: {
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "statBump", stat: "Int", amount: 2 } },
      { roll: 3, benefit: { kind: "statBump", stat: "Edu", amount: 1 } },
      { roll: 4, benefit: { kind: "weapon" } },
      { roll: 5, benefit: { kind: "tasMembership" } },
      { roll: 6, benefit: { kind: "highPassage" } },
      { roll: 7, benefit: { kind: "statBump", stat: "Soc", amount: 2 } },
    ],
    cash: [
      { roll: 1, credits: 2000 },
      { roll: 2, credits: 5000 },
      { roll: 3, credits: 5000 },
      { roll: 4, credits: 10000 },
      { roll: 5, credits: 20000 },
      { roll: 6, credits: 30000 },
      { roll: 7, credits: 40000 },
    ],
  },
  skillsPerInitialTerm: 2,
  skillsPerSubsequentTerm: 1,
  canRetire: true,
  bypassesHomeworldSkillLimits: false,
  anagathicsSurvivalDm: -1,
  draftSlot: 2,
};
