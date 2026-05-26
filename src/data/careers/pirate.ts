/**
 * Pirate career — Basic Character Generation.
 * Enlistment DM: Soc 7- (low Soc helps).
 */

import type { CareerDef } from "../../engine/types";

export const PIRATE: CareerDef = {
  id: "Pirate",
  name: "Pirate",
  enlistmentRestrictions: [],
  thresholds: {
    enlistment: {
      target: 7,
      dms: [
        { value: 1, condition: { stat: "Soc", op: "<=", n: 7 } },
        { value: 2, condition: { stat: "End", op: ">=", n: 9 } },
      ],
    },
    survival: {
      target: 6,
      dms: [{ value: 2, condition: { stat: "Int", op: ">=", n: 8 } }],
    },
    commission: {
      target: 9,
      dms: [{ value: 1, condition: { stat: "Str", op: ">=", n: 10 } }],
    },
    promotion: {
      target: 8,
      dms: [{ value: 1, condition: { stat: "Int", op: ">=", n: 9 } }],
    },
    specialDuty: { target: 5, dms: [] },
    reenlist: { target: 7, dms: [] },
  },
  ranks: ["Henchman", "Corporal", "Sergeant", "Lieutenant", "Leader"],
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
        { roll: 6, skillId: "BladeCombat" },
      ],
    },
    {
      id: "serviceSkills",
      name: "Service Skills",
      entries: [
        { roll: 1, skillId: "Space" },
        { roll: 2, skillId: "ZeroGEnviron" },
        { roll: 3, skillId: "GunCombat" },
        { roll: 4, skillId: "SpecialCombat" },
        { roll: 5, skillId: "BladeCombat" },
        { roll: 6, skillId: "GunCombat" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "Vice" },
        { roll: 2, skillId: "Mechanical" },
        { roll: 3, skillId: "Gunnery" },
        { roll: 4, skillId: "ShipTactics" },
        { roll: 5, skillId: "Tactics" },
        { roll: 6, skillId: "Space" },
      ],
    },
    {
      id: "advancedEducation8plus",
      name: "Advanced Education (Edu 8+)",
      minEdu: 8,
      entries: [
        { roll: 1, skillId: "Pilot" },
        { roll: 2, skillId: "Space" },
        { roll: 3, skillId: "Vice" },
        { roll: 4, skillId: "Technical" },
        { roll: 5, skillId: "Inborn" },
        { roll: 6, skillId: "Electronics" },
      ],
    },
  ],
  musteringOut: {
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "statBump", stat: "Int", amount: 1 } },
      { roll: 3, benefit: { kind: "weapon" } },
      { roll: 4, benefit: { kind: "object", objectId: "letterOfMarque" } },
      { roll: 5, benefit: { kind: "statBump", stat: "Soc", amount: -1 } },
      { roll: 6, benefit: { kind: "midPassage" } },
      { roll: 7, benefit: { kind: "object", objectId: "corsair" } },
    ],
    cash: [
      { roll: 1, credits: 0 },
      { roll: 2, credits: 0 },
      { roll: 3, credits: 1000 },
      { roll: 4, credits: 10000 },
      { roll: 5, credits: 50000 },
      { roll: 6, credits: 50000 },
      { roll: 7, credits: 50000 },
    ],
  },
  skillsPerInitialTerm: 2,
  skillsPerSubsequentTerm: 1,
  canRetire: false,
  bypassesHomeworldSkillLimits: false,
  anagathicsSurvivalDm: -1,
};
