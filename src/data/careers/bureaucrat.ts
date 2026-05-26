/**
 * Bureaucrat career — Basic Character Generation.
 * Special rule: must reenlist if reenlistment throw is successful.
 * Enlistment DM: Str 8-, an "8 or less" DM.
 */

import type { CareerDef } from "../../engine/types";

export const BUREAUCRAT: CareerDef = {
  id: "Bureaucrat",
  name: "Bureaucrat",
  enlistmentRestrictions: [
    {
      description: "Homeworld must be Low Law+ (law 1+) and Mod Pop+ (pop 5+)",
      matches: (h) => h.lawLevel >= 1 && h.population >= 5,
    },
  ],
  thresholds: {
    enlistment: {
      target: 5,
      dms: [
        { value: 1, condition: { stat: "Edu", op: ">=", n: 8 } },
        { value: 2, condition: { stat: "Str", op: "<=", n: 8 } },
      ],
    },
    survival: {
      target: 4,
      dms: [{ value: 2, condition: { stat: "Edu", op: ">=", n: 10 } }],
    },
    commission: {
      target: 6,
      dms: [{ value: 1, condition: { stat: "Soc", op: ">=", n: 9 } }],
    },
    promotion: {
      target: 7,
      dms: [{ value: 1, condition: { stat: "Int", op: ">=", n: 9 } }],
    },
    specialDuty: { target: 6, dms: [] },
    reenlist: { target: 5, dms: [] },
  },
  ranks: ["Clerk", "Supervisor", "Asst Mgr", "Manager", "Executive", "Director"],
  acquiredSkillTables: [
    {
      id: "personalDevelopment",
      name: "Personal Development",
      entries: [
        { roll: 1, skillId: "End", statBump: "End" },
        { roll: 2, skillId: "Edu", statBump: "Edu" },
        { roll: 3, skillId: "Mental" },
        { roll: 4, skillId: "Brawling" },
        { roll: 5, skillId: "Dex", statBump: "Dex" },
        { roll: 6, skillId: "Inborn" },
      ],
    },
    {
      id: "serviceSkills",
      name: "Service Skills",
      entries: [
        { roll: 1, skillId: "GunCombat" },
        { roll: 2, skillId: "Vehicle" },
        { roll: 3, skillId: "HandCombat" },
        { roll: 4, skillId: "Inborn" },
        { roll: 5, skillId: "Vehicle" },
        { roll: 6, skillId: "Edu", statBump: "Edu" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "Recruiting" },
        { roll: 2, skillId: "Vehicle" },
        { roll: 3, skillId: "Liaison" },
        { roll: 4, skillId: "Interrogation" },
        { roll: 5, skillId: "Interpersonal" },
        { roll: 6, skillId: "Economic" },
      ],
    },
    {
      id: "advancedEducation8plus",
      name: "Advanced Education (Edu 8+)",
      minEdu: 8,
      entries: [
        { roll: 1, skillId: "Economic" },
        { roll: 2, skillId: "Academic" },
        { roll: 3, skillId: "Computer" },
        { roll: 4, skillId: "Admin" },
        { roll: 5, skillId: "Inborn" },
        { roll: 6, skillId: "Leader" },
      ],
    },
  ],
  musteringOut: {
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "midPassage" } },
      { roll: 3, benefit: { kind: "highPassage" } },
      { roll: 4, benefit: { kind: "object", objectId: "watch" } },
      { roll: 5, benefit: { kind: "none" } },
      { roll: 6, benefit: { kind: "highPassage" } },
      { roll: 7, benefit: { kind: "statBump", stat: "Soc", amount: 1 } },
    ],
    cash: [
      { roll: 1, credits: 0 },
      { roll: 2, credits: 0 },
      { roll: 3, credits: 10000 },
      { roll: 4, credits: 10000 },
      { roll: 5, credits: 40000 },
      { roll: 6, credits: 40000 },
      { roll: 7, credits: 80000 },
    ],
  },
  skillsPerInitialTerm: 2,
  skillsPerSubsequentTerm: 1,
  canRetire: true,
  bypassesHomeworldSkillLimits: false,
  anagathicsSurvivalDm: -1,
  mandatoryReenlistOnSuccess: true,
};
