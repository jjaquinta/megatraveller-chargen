/**
 * Flyer career — Basic Character Generation.
 *
 * Restriction in book: Industrial+, Mod Pop+, Atmos Thin+.
 * Roughly: techLevel >= 4 (Industrial), population >= 5 (Moderate),
 * atmosphere 2..9 (thin or denser, excluding vacuum/very-thin/special).
 * "Thin+" is interpreted here as atmosphere code 2 or higher.
 */

import type { CareerDef } from "../../engine/types";

export const FLYER: CareerDef = {
  id: "Flyer",
  name: "Flyer",
  enlistmentRestrictions: [
    {
      description: "Homeworld must be Industrial+ (tech 4+), Mod Pop+ (pop 5+), Atmos Thin+ (atm 2+)",
      matches: (h) => h.techLevel >= 4 && h.population >= 5 && h.atmosphere >= 2,
    },
  ],
  thresholds: {
    enlistment: {
      target: 6,
      dms: [
        { value: 1, condition: { stat: "Str", op: ">=", n: 7 } },
        { value: 2, condition: { stat: "Dex", op: ">=", n: 9 } },
      ],
    },
    survival: {
      target: 5,
      dms: [{ value: 2, condition: { stat: "Dex", op: ">=", n: 8 } }],
    },
    commission: {
      target: 5,
      dms: [{ value: 1, condition: { stat: "Edu", op: ">=", n: 6 } }],
    },
    promotion: {
      target: 8,
      dms: [{ value: 1, condition: { stat: "Edu", op: ">=", n: 8 } }],
    },
    specialDuty: { target: 6, dms: [] },
    reenlist: { target: 6, dms: [] },
  },
  ranks: ["Pilot", "Flight Ldr", "Sqdn Ldr", "Staff Major", "Group Ldr", "Air Marshal"],
  acquiredSkillTables: [
    {
      id: "personalDevelopment",
      name: "Personal Development",
      entries: [
        { roll: 1, skillId: "Physical" },
        { roll: 2, skillId: "Dex", statBump: "Dex" },
        { roll: 3, skillId: "End", statBump: "End" },
        { roll: 4, skillId: "Vice" },
        { roll: 5, skillId: "Brawling" },
        { roll: 6, skillId: "Inborn" },
      ],
    },
    {
      id: "serviceSkills",
      name: "Service Skills",
      entries: [
        { roll: 1, skillId: "HandCombat" },
        { roll: 2, skillId: "VaccSuit" },
        { roll: 3, skillId: "GunCombat" },
        { roll: 4, skillId: "Vehicle" },
        { roll: 5, skillId: "Vehicle" },
        { roll: 6, skillId: "Vehicle" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "Aircraft" },
        { roll: 2, skillId: "Mechanical" },
        { roll: 3, skillId: "Electronics" },
        { roll: 4, skillId: "Gravitics" },
        { roll: 5, skillId: "GunCombat" },
        { roll: 6, skillId: "Survival" },
      ],
    },
    {
      id: "advancedEducation8plus",
      name: "Advanced Education (Edu 8+)",
      minEdu: 8,
      entries: [
        { roll: 1, skillId: "Medical" },
        { roll: 2, skillId: "Inborn" },
        { roll: 3, skillId: "Space" },
        { roll: 4, skillId: "Technical" },
        { roll: 5, skillId: "Inborn" },
        { roll: 6, skillId: "Interpersonal" },
      ],
    },
  ],
  musteringOut: {
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "statBump", stat: "Edu", amount: 1 } },
      { roll: 3, benefit: { kind: "highPassage" } },
      { roll: 4, benefit: { kind: "weapon" } },
      { roll: 5, benefit: { kind: "highPassage" } },
      { roll: 6, benefit: { kind: "midPassage" } },
      { roll: 7, benefit: { kind: "statBump", stat: "Soc", amount: 1 } },
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
  draftSlot: 5,
};
