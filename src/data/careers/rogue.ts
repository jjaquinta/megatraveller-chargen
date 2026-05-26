/**
 * Rogue career — Basic Character Generation.
 * No commission/promotion. No retirement.
 */

import type { CareerDef } from "../../engine/types";

export const ROGUE: CareerDef = {
  id: "Rogue",
  name: "Rogue",
  enlistmentRestrictions: [],
  thresholds: {
    enlistment: {
      target: 6,
      dms: [
        { value: 1, condition: { stat: "Soc", op: "<=", n: 8 } },
        { value: 2, condition: { stat: "End", op: ">=", n: 7 } },
      ],
    },
    survival: {
      target: 7,
      dms: [{ value: 2, condition: { stat: "Int", op: ">=", n: 9 } }],
    },
    commission: null,
    promotion: null,
    specialDuty: { target: 5, dms: [] },
    reenlist: { target: 5, dms: [] },
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
        { roll: 5, skillId: "HandCombat" },
        { roll: 6, skillId: "Carousing" },
      ],
    },
    {
      id: "serviceSkills",
      name: "Service Skills",
      entries: [
        { roll: 1, skillId: "HandCombat" },
        { roll: 2, skillId: "GunCombat" },
        { roll: 3, skillId: "Demolitions" },
        { roll: 4, skillId: "Vehicle" },
        { roll: 5, skillId: "Edu", statBump: "Edu" },
        { roll: 6, skillId: "Vehicle" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "Vice" },
        { roll: 2, skillId: "Vice" },
        { roll: 3, skillId: "Streetwise" },
        { roll: 4, skillId: "Inborn" },
        { roll: 5, skillId: "Interpersonal" },
        { roll: 6, skillId: "Tactics" },
      ],
    },
    {
      id: "advancedEducation8plus",
      name: "Advanced Education (Edu 8+)",
      minEdu: 8,
      entries: [
        { roll: 1, skillId: "Medical" },
        { roll: 2, skillId: "Vice" },
        { roll: 3, skillId: "Vice" },
        { roll: 4, skillId: "Technical" },
        { roll: 5, skillId: "Inborn" },
        { roll: 6, skillId: "Inborn" },
      ],
    },
  ],
  musteringOut: {
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "statBump", stat: "Soc", amount: 1 } },
      { roll: 3, benefit: { kind: "weapon" } },
      { roll: 4, benefit: { kind: "weapon" } },
      { roll: 5, benefit: { kind: "highPassage" } },
      { roll: 6, benefit: { kind: "tasMembership" } },
      { roll: 7, benefit: { kind: "none" } },
    ],
    cash: [
      { roll: 1, credits: 0 },
      { roll: 2, credits: 0 },
      { roll: 3, credits: 10000 },
      { roll: 4, credits: 10000 },
      { roll: 5, credits: 50000 },
      { roll: 6, credits: 100000 },
      { roll: 7, credits: 100000 },
    ],
  },
  skillsPerInitialTerm: 2,
  skillsPerSubsequentTerm: 1,
  canRetire: false,
  bypassesHomeworldSkillLimits: false,
  anagathicsSurvivalDm: -1,
};
