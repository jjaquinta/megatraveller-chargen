/**
 * Doctor career — Basic Character Generation.
 * Two skills per term; no commission/promotion.
 */

import type { CareerDef } from "../../engine/types";

export const DOCTOR: CareerDef = {
  id: "Doctor",
  name: "Doctor",
  enlistmentRestrictions: [
    { description: "Homeworld must be Industrial+ (tech 4+)", matches: (h) => h.techLevel >= 4 },
  ],
  thresholds: {
    enlistment: {
      target: 9,
      dms: [
        { value: 1, condition: { stat: "Int", op: ">=", n: 8 } },
        { value: 2, condition: { stat: "Dex", op: ">=", n: 9 } },
      ],
    },
    survival: {
      target: 4,
      dms: [{ value: 2, condition: { stat: "Int", op: ">=", n: 8 } }],
    },
    commission: null,
    promotion: null,
    specialDuty: { target: 6, dms: [] },
    reenlist: { target: 4, dms: [] },
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
        { roll: 5, skillId: "Edu", statBump: "Edu" },
        { roll: 6, skillId: "Soc", statBump: "Soc" },
      ],
    },
    {
      id: "serviceSkills",
      name: "Service Skills",
      entries: [
        { roll: 1, skillId: "Dex", statBump: "Dex" },
        { roll: 2, skillId: "Technical" },
        { roll: 3, skillId: "Medical" },
        { roll: 4, skillId: "Vice" },
        { roll: 5, skillId: "Medical" },
        { roll: 6, skillId: "BladeCombat" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "Medical" },
        { roll: 2, skillId: "Medical" },
        { roll: 3, skillId: "Mechanical" },
        { roll: 4, skillId: "Electronics" },
        { roll: 5, skillId: "Technical" },
        { roll: 6, skillId: "Academic" },
      ],
    },
    {
      id: "advancedEducation8plus",
      name: "Advanced Education (Edu 8+)",
      minEdu: 8,
      entries: [
        { roll: 1, skillId: "Medical" },
        { roll: 2, skillId: "Science" },
        { roll: 3, skillId: "Interpersonal" },
        { roll: 4, skillId: "Technical" },
        { roll: 5, skillId: "Mental" },
        { roll: 6, skillId: "Academic" },
      ],
    },
  ],
  musteringOut: {
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "statBump", stat: "Edu", amount: 1 } },
      { roll: 3, benefit: { kind: "statBump", stat: "Edu", amount: 1 } },
      { roll: 4, benefit: { kind: "weapon" } },
      { roll: 5, benefit: { kind: "object", objectId: "instrument" } },
      { roll: 6, benefit: { kind: "midPassage" } },
      { roll: 7, benefit: { kind: "none" } },
    ],
    cash: [
      { roll: 1, credits: 20000 },
      { roll: 2, credits: 20000 },
      { roll: 3, credits: 20000 },
      { roll: 4, credits: 30000 },
      { roll: 5, credits: 40000 },
      { roll: 6, credits: 60000 },
      { roll: 7, credits: 100000 },
    ],
  },
  skillsPerInitialTerm: 2,
  skillsPerSubsequentTerm: 2,
  canRetire: true,
  bypassesHomeworldSkillLimits: false,
  anagathicsSurvivalDm: -1,
};
