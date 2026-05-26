/**
 * Law Enforcer career — Basic Character Generation.
 */

import type { CareerDef } from "../../engine/types";

export const LAW_ENFORCER: CareerDef = {
  id: "LawEnforcer",
  name: "Law Enforcer",
  enlistmentRestrictions: [
    {
      description: "Homeworld must be Industrial+ (tech 4+)",
      matches: (h) => h.techLevel >= 4,
    },
  ],
  thresholds: {
    enlistment: {
      target: 6,
      dms: [
        { value: 1, condition: { stat: "Int", op: ">=", n: 7 } },
        { value: 2, condition: { stat: "Dex", op: ">=", n: 10 } },
      ],
    },
    survival: {
      target: 6,
      dms: [{ value: 2, condition: { stat: "Int", op: ">=", n: 7 } }],
    },
    commission: {
      target: 6,
      dms: [{ value: 1, condition: { stat: "Edu", op: ">=", n: 7 } }],
    },
    promotion: {
      target: 8,
      dms: [{ value: 1, condition: { stat: "Edu", op: ">=", n: 8 } }],
    },
    specialDuty: { target: 4, dms: [] },
    reenlist: { target: 6, dms: [] },
  },
  ranks: ["Corporal", "Sergeant", "Lieutenant", "Detective", "Chief", "Commissioner"],
  acquiredSkillTables: [
    {
      id: "personalDevelopment",
      name: "Personal Development",
      entries: [
        { roll: 1, skillId: "Physical" },
        { roll: 2, skillId: "Dex", statBump: "Dex" },
        { roll: 3, skillId: "Mental" },
        { roll: 4, skillId: "HandCombat" },
        { roll: 5, skillId: "Vice" },
        { roll: 6, skillId: "Gambling" },
      ],
    },
    {
      id: "serviceSkills",
      name: "Service Skills",
      entries: [
        { roll: 1, skillId: "Streetwise" },
        { roll: 2, skillId: "Vehicle" },
        { roll: 3, skillId: "Inborn" },
        { roll: 4, skillId: "HandCombat" },
        { roll: 5, skillId: "BladeCombat" },
        { roll: 6, skillId: "GunCombat" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "Vice" },
        { roll: 2, skillId: "Forensic" },
        { roll: 3, skillId: "Environ" },
        { roll: 4, skillId: "Tactics" },
        { roll: 5, skillId: "Technical" },
        { roll: 6, skillId: "Interrogation" },
      ],
    },
    {
      id: "advancedEducation8plus",
      name: "Advanced Education (Edu 8+)",
      minEdu: 8,
      entries: [
        { roll: 1, skillId: "Legal" },
        { roll: 2, skillId: "Inborn" },
        { roll: 3, skillId: "Economic" },
        { roll: 4, skillId: "Interview" },
        { roll: 5, skillId: "Forensic" },
        { roll: 6, skillId: "Interpersonal" },
      ],
    },
  ],
  musteringOut: {
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "statBump", stat: "Int", amount: 1 } },
      { roll: 3, benefit: { kind: "object", objectId: "forensicKit" } },
      { roll: 4, benefit: { kind: "weapon" } },
      { roll: 5, benefit: { kind: "highPassage" } },
      { roll: 6, benefit: { kind: "statBump", stat: "Soc", amount: 1 } },
      { roll: 7, benefit: { kind: "tasMembership" } },
    ],
    cash: [
      { roll: 1, credits: 1000 },
      { roll: 2, credits: 2000 },
      { roll: 3, credits: 5000 },
      { roll: 4, credits: 7500 },
      { roll: 5, credits: 10000 },
      { roll: 6, credits: 25000 },
      { roll: 7, credits: 50000 },
    ],
  },
  skillsPerInitialTerm: 2,
  skillsPerSubsequentTerm: 1,
  canRetire: true,
  bypassesHomeworldSkillLimits: false,
  anagathicsSurvivalDm: -1,
};
