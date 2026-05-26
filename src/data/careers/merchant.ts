/**
 * Merchant career — Basic Character Generation.
 */

import type { CareerDef } from "../../engine/types";

export const MERCHANT: CareerDef = {
  id: "Merchant",
  name: "Merchant",
  enlistmentRestrictions: [],
  thresholds: {
    enlistment: {
      target: 7,
      dms: [
        { value: 1, condition: { stat: "Str", op: ">=", n: 7 } },
        { value: 2, condition: { stat: "Int", op: ">=", n: 6 } },
      ],
    },
    survival: {
      target: 5,
      dms: [{ value: 2, condition: { stat: "Int", op: ">=", n: 7 } }],
    },
    commission: {
      // "Position" in book; we reuse commission machinery.
      target: 4,
      dms: [{ value: 1, condition: { stat: "Int", op: ">=", n: 6 } }],
    },
    promotion: {
      target: 10,
      dms: [{ value: 1, condition: { stat: "Int", op: ">=", n: 9 } }],
    },
    specialDuty: { target: 4, dms: [] },
    reenlist: { target: 4, dms: [] },
  },
  ranks: ["4th Officer", "3rd Officer", "2nd Officer", "1st Officer", "Captain", "Owner"],
  acquiredSkillTables: [
    {
      id: "personalDevelopment",
      name: "Personal Development",
      entries: [
        { roll: 1, skillId: "Physical" },
        { roll: 2, skillId: "Dex", statBump: "Dex" },
        { roll: 3, skillId: "End", statBump: "End" },
        { roll: 4, skillId: "HandCombat" },
        { roll: 5, skillId: "BladeCombat" },
        { roll: 6, skillId: "Vice" },
      ],
    },
    {
      id: "serviceSkills",
      name: "Service Skills",
      entries: [
        { roll: 1, skillId: "Vehicle" },
        { roll: 2, skillId: "VaccSuit" },
        { roll: 3, skillId: "Inborn" },
        { roll: 4, skillId: "Interpersonal" },
        { roll: 5, skillId: "Technical" },
        { roll: 6, skillId: "GunCombat" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "Streetwise" },
        { roll: 2, skillId: "Mechanical" },
        { roll: 3, skillId: "Electronics" },
        { roll: 4, skillId: "Space" },
        { roll: 5, skillId: "SpaceCombat" },
        { roll: 6, skillId: "Academic" },
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
        { roll: 5, skillId: "Exploratory" },
        { roll: 6, skillId: "Economic" },
      ],
    },
  ],
  musteringOut: {
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "statBump", stat: "Int", amount: 1 } },
      { roll: 3, benefit: { kind: "statBump", stat: "Edu", amount: 2 } },
      { roll: 4, benefit: { kind: "weapon" } },
      { roll: 5, benefit: { kind: "weapon" } },
      { roll: 6, benefit: { kind: "lowPassage" } },
      { roll: 7, benefit: { kind: "object", objectId: "freeTrader" } },
    ],
    cash: [
      { roll: 1, credits: 1000 },
      { roll: 2, credits: 5000 },
      { roll: 3, credits: 10000 },
      { roll: 4, credits: 10000 },
      { roll: 5, credits: 10000 },
      { roll: 6, credits: 20000 },
      { roll: 7, credits: 50000 },
    ],
  },
  skillsPerInitialTerm: 2,
  skillsPerSubsequentTerm: 1,
  canRetire: true,
  bypassesHomeworldSkillLimits: false,
  anagathicsSurvivalDm: -1,
};
