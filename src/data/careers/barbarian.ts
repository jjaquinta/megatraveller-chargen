/**
 * Barbarian career — Basic Character Generation.
 */

import type { CareerDef } from "../../engine/types";

export const BARBARIAN: CareerDef = {
  id: "Barbarian",
  name: "Barbarian",
  enlistmentRestrictions: [],
  thresholds: {
    enlistment: {
      target: 5,
      dms: [
        { value: 1, condition: { stat: "End", op: ">=", n: 9 } },
        { value: 2, condition: { stat: "Str", op: ">=", n: 10 } },
      ],
    },
    survival: {
      target: 6,
      dms: [{ value: 2, condition: { stat: "Str", op: ">=", n: 8 } }],
    },
    commission: {
      target: 6,
      dms: [{ value: 1, condition: { stat: "Str", op: ">=", n: 10 } }],
    },
    promotion: {
      target: 9,
      dms: [{ value: 1, condition: { stat: "Int", op: ">=", n: 6 } }],
    },
    specialDuty: { target: 7, dms: [] },
    reenlist: { target: 6, dms: [] },
  },
  ranks: ["Brave", "Warrior", "Leader", "Chieftain", "Chief", "Elder"],
  acquiredSkillTables: [
    {
      id: "personalDevelopment",
      name: "Personal Development",
      entries: [
        { roll: 1, skillId: "Physical" },
        { roll: 2, skillId: "Dex", statBump: "Dex" },
        { roll: 3, skillId: "Physical" },
        { roll: 4, skillId: "Vice" },
        { roll: 5, skillId: "Physical" },
        { roll: 6, skillId: "HandCombat" },
      ],
    },
    {
      id: "serviceSkills",
      name: "Service Skills",
      entries: [
        { roll: 1, skillId: "HandCombat" },
        { roll: 2, skillId: "HandCombat" },
        { roll: 3, skillId: "BladeCombat" },
        { roll: 4, skillId: "Environ" },
        { roll: 5, skillId: "ArchaicWeapons" },
        { roll: 6, skillId: "GunCombat" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "HandCombat" },
        { roll: 2, skillId: "Mechanical" },
        { roll: 3, skillId: "Environ" },
        { roll: 4, skillId: "Environ" },
        { roll: 5, skillId: "Vice" },
        { roll: 6, skillId: "ArchaicWeapons" },
      ],
    },
    {
      id: "advancedEducation8plus",
      name: "Advanced Education (Edu 8+)",
      minEdu: 8,
      entries: [
        { roll: 1, skillId: "Medical" },
        { roll: 2, skillId: "Interrogation" },
        { roll: 3, skillId: "Tactics" },
        { roll: 4, skillId: "Environ" },
        { roll: 5, skillId: "Inborn" },
        { roll: 6, skillId: "Inborn" },
      ],
    },
  ],
  musteringOut: {
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "weapon" } },
      { roll: 3, benefit: { kind: "weapon" } },
      { roll: 4, benefit: { kind: "weapon" } },
      { roll: 5, benefit: { kind: "none" } },
      { roll: 6, benefit: { kind: "highPassage" } },
      { roll: 7, benefit: { kind: "highPassage" } },
    ],
    cash: [
      { roll: 1, credits: 0 },
      { roll: 2, credits: 0 },
      { roll: 3, credits: 1000 },
      { roll: 4, credits: 2000 },
      { roll: 5, credits: 3000 },
      { roll: 6, credits: 4000 },
      { roll: 7, credits: 5000 },
    ],
  },
  skillsPerInitialTerm: 2,
  skillsPerSubsequentTerm: 1,
  canRetire: false,
  bypassesHomeworldSkillLimits: false,
  anagathicsSurvivalDm: -1,
};
