/**
 * Scientist career — Basic Character Generation.
 * Two skills per term; no commission/promotion.
 */

import type { CareerDef } from "../../engine/types";

export const SCIENTIST: CareerDef = {
  id: "Scientist",
  name: "Scientist",
  enlistmentRestrictions: [
    {
      description: "Homeworld must be Pre-Stellar or higher (tech 7+)",
      matches: (h) => h.techLevel >= 7,
    },
  ],
  thresholds: {
    enlistment: {
      target: 6,
      dms: [
        { value: 1, condition: { stat: "Int", op: ">=", n: 9 } },
        { value: 2, condition: { stat: "Edu", op: ">=", n: 10 } },
      ],
    },
    survival: {
      target: 5,
      dms: [{ value: 2, condition: { stat: "Edu", op: ">=", n: 9 } }],
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
        { roll: 1, skillId: "Str", statBump: "Str" },
        { roll: 2, skillId: "Dex", statBump: "Dex" },
        { roll: 3, skillId: "End", statBump: "End" },
        { roll: 4, skillId: "Mental" },
        { roll: 5, skillId: "Interpersonal" },
        { roll: 6, skillId: "Inborn" },
      ],
    },
    {
      id: "serviceSkills",
      name: "Service Skills",
      entries: [
        { roll: 1, skillId: "GunCombat" },
        { roll: 2, skillId: "HandCombat" },
        { roll: 3, skillId: "Inborn" },
        { roll: 4, skillId: "Vehicle" },
        { roll: 5, skillId: "SpaceTech" },
        { roll: 6, skillId: "Environ" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "Mechanical" },
        { roll: 2, skillId: "Electronics" },
        { roll: 3, skillId: "Technical" },
        { roll: 4, skillId: "Technical" },
        { roll: 5, skillId: "Academic" },
        { roll: 6, skillId: "Academic" },
      ],
    },
    {
      id: "advancedEducation8plus",
      name: "Advanced Education (Edu 8+)",
      minEdu: 8,
      entries: [
        { roll: 1, skillId: "Science" },
        { roll: 2, skillId: "Science" },
        { roll: 3, skillId: "Academic" },
        { roll: 4, skillId: "Inborn" },
        { roll: 5, skillId: "Mental" },
        { roll: 6, skillId: "Academic" },
      ],
    },
  ],
  musteringOut: {
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "midPassage" } },
      { roll: 3, benefit: { kind: "weapon" } },
      { roll: 4, benefit: { kind: "statBump", stat: "Soc", amount: 1 } },
      { roll: 5, benefit: { kind: "weapon" } },
      { roll: 6, benefit: { kind: "object", objectId: "labShip" } },
      { roll: 7, benefit: { kind: "none" } },
    ],
    cash: [
      { roll: 1, credits: 1000 },
      { roll: 2, credits: 2000 },
      { roll: 3, credits: 5000 },
      { roll: 4, credits: 10000 },
      { roll: 5, credits: 20000 },
      { roll: 6, credits: 30000 },
      { roll: 7, credits: 40000 },
    ],
  },
  skillsPerInitialTerm: 2,
  skillsPerSubsequentTerm: 2,
  canRetire: true,
  bypassesHomeworldSkillLimits: false,
  anagathicsSurvivalDm: -1,
};
