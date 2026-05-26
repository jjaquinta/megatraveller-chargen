/**
 * Hunter career — Basic Character Generation.
 * No commission/promotion. No retirement.
 */

import type { CareerDef } from "../../engine/types";

export const HUNTER: CareerDef = {
  id: "Hunter",
  name: "Hunter",
  enlistmentRestrictions: [],
  thresholds: {
    enlistment: {
      target: 9,
      dms: [
        { value: 1, condition: { stat: "Dex", op: ">=", n: 10 } },
        { value: 2, condition: { stat: "End", op: ">=", n: 9 } },
      ],
    },
    survival: {
      target: 6,
      dms: [{ value: 2, condition: { stat: "Str", op: ">=", n: 10 } }],
    },
    commission: null,
    promotion: null,
    specialDuty: { target: 6, dms: [] },
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
        { roll: 4, skillId: "Mental" },
        { roll: 5, skillId: "GunCombat" },
        { roll: 6, skillId: "BladeCombat" },
      ],
    },
    {
      id: "serviceSkills",
      name: "Service Skills",
      entries: [
        { roll: 1, skillId: "HandCombat" },
        { roll: 2, skillId: "GunCombat" },
        { roll: 3, skillId: "Environ" },
        { roll: 4, skillId: "Environ" },
        { roll: 5, skillId: "Hunting" },
        { roll: 6, skillId: "Vehicle" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "Electronics" },
        { roll: 2, skillId: "Mechanical" },
        { roll: 3, skillId: "Technical" },
        { roll: 4, skillId: "Computer" },
        { roll: 5, skillId: "Environ" },
        { roll: 6, skillId: "Economic" },
      ],
    },
    {
      id: "advancedEducation8plus",
      name: "Advanced Education (Edu 8+)",
      minEdu: 8,
      entries: [
        { roll: 1, skillId: "Medical" },
        { roll: 2, skillId: "Technical" },
        { roll: 3, skillId: "Hunting" },
        { roll: 4, skillId: "Exploratory" },
        { roll: 5, skillId: "Inborn" },
        { roll: 6, skillId: "Academic" },
      ],
    },
  ],
  musteringOut: {
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "highPassage" } },
      { roll: 3, benefit: { kind: "weapon" } },
      { roll: 4, benefit: { kind: "weapon" } },
      { roll: 5, benefit: { kind: "weapon" } },
      { roll: 6, benefit: { kind: "object", objectId: "safariShip" } },
      { roll: 7, benefit: { kind: "none" } },
    ],
    cash: [
      { roll: 1, credits: 1000 },
      { roll: 2, credits: 1000 },
      { roll: 3, credits: 5000 },
      { roll: 4, credits: 5000 },
      { roll: 5, credits: 10000 },
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
