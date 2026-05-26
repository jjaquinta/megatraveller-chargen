/**
 * Diplomat career — Basic Character Generation.
 */

import type { CareerDef } from "../../engine/types";

export const DIPLOMAT: CareerDef = {
  id: "Diplomat",
  name: "Diplomat",
  enlistmentRestrictions: [
    {
      description: "Homeworld must be Low Law+ (law 1+) and Industrial+ (tech 4+)",
      matches: (h) => h.lawLevel >= 1 && h.techLevel >= 4,
    },
  ],
  thresholds: {
    enlistment: {
      target: 8,
      dms: [
        { value: 1, condition: { stat: "Edu", op: ">=", n: 8 } },
        { value: 2, condition: { stat: "Soc", op: ">=", n: 9 } },
      ],
    },
    survival: {
      target: 4,
      dms: [{ value: 2, condition: { stat: "Edu", op: ">=", n: 9 } }],
    },
    commission: {
      target: 5,
      dms: [{ value: 1, condition: { stat: "Int", op: ">=", n: 8 } }],
    },
    promotion: {
      target: 10,
      dms: [{ value: 1, condition: { stat: "Soc", op: ">=", n: 10 } }],
    },
    specialDuty: { target: 5, dms: [] },
    reenlist: { target: 5, dms: [] },
  },
  ranks: ["3rd Secy", "2nd Secy", "1st Secy", "Counselor", "Minister", "Ambassador"],
  acquiredSkillTables: [
    {
      id: "personalDevelopment",
      name: "Personal Development",
      entries: [
        { roll: 1, skillId: "Physical" },
        { roll: 2, skillId: "Edu", statBump: "Edu" },
        { roll: 3, skillId: "Mental" },
        { roll: 4, skillId: "BladeCombat" },
        { roll: 5, skillId: "GunCombat" },
        { roll: 6, skillId: "Inborn" },
      ],
    },
    {
      id: "serviceSkills",
      name: "Service Skills",
      entries: [
        { roll: 1, skillId: "Mental" },
        { roll: 2, skillId: "VaccSuit" },
        { roll: 3, skillId: "Vehicle" },
        { roll: 4, skillId: "Vehicle" },
        { roll: 5, skillId: "Vice" },
        { roll: 6, skillId: "Computer" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "Vice" },
        { roll: 2, skillId: "Streetwise" },
        { roll: 3, skillId: "Interrogation" },
        { roll: 4, skillId: "Recruiting" },
        { roll: 5, skillId: "Inborn" },
        { roll: 6, skillId: "Economic" },
      ],
    },
    {
      id: "advancedEducation8plus",
      name: "Advanced Education (Edu 8+)",
      minEdu: 8,
      entries: [
        { roll: 1, skillId: "Liaison" },
        { roll: 2, skillId: "Interpersonal" },
        { roll: 3, skillId: "Academic" },
        { roll: 4, skillId: "Technical" },
        { roll: 5, skillId: "Inborn" },
        { roll: 6, skillId: "Soc", statBump: "Soc" },
      ],
    },
  ],
  musteringOut: {
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "statBump", stat: "Int", amount: 1 } },
      { roll: 3, benefit: { kind: "statBump", stat: "Edu", amount: 2 } },
      { roll: 4, benefit: { kind: "weapon" } },
      { roll: 5, benefit: { kind: "statBump", stat: "Soc", amount: 1 } },
      { roll: 6, benefit: { kind: "highPassage" } },
      { roll: 7, benefit: { kind: "tasMembership" } },
    ],
    cash: [
      { roll: 1, credits: 2000 },
      { roll: 2, credits: 5000 },
      { roll: 3, credits: 10000 },
      { roll: 4, credits: 10000 },
      { roll: 5, credits: 10000 },
      { roll: 6, credits: 20000 },
      { roll: 7, credits: 30000 },
    ],
  },
  skillsPerInitialTerm: 2,
  skillsPerSubsequentTerm: 1,
  canRetire: true,
  bypassesHomeworldSkillLimits: false,
  anagathicsSurvivalDm: -1,
};
