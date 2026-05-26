/**
 * Sailor career — Basic Character Generation.
 * Restriction: Wet World (hydrographics >= 6).
 */

import type { CareerDef } from "../../engine/types";

export const SAILOR: CareerDef = {
  id: "Sailor",
  name: "Sailor",
  enlistmentRestrictions: [
    {
      description: "Homeworld must be a Wet World (hydrographics 6+)",
      matches: (h) => h.hydrographics >= 6,
    },
  ],
  thresholds: {
    enlistment: {
      target: 6,
      dms: [
        { value: 1, condition: { stat: "End", op: ">=", n: 10 } },
        { value: 2, condition: { stat: "Str", op: ">=", n: 8 } },
      ],
    },
    survival: {
      target: 5,
      dms: [{ value: 2, condition: { stat: "End", op: ">=", n: 8 } }],
    },
    commission: {
      target: 5,
      dms: [{ value: 1, condition: { stat: "Int", op: ">=", n: 9 } }],
    },
    promotion: {
      target: 6,
      dms: [{ value: 1, condition: { stat: "Edu", op: ">=", n: 8 } }],
    },
    specialDuty: { target: 6, dms: [] },
    reenlist: { target: 6, dms: [] },
  },
  ranks: ["Ensign", "Lieutenant", "Lt Cdr", "Commander", "Captain", "Admiral"],
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
        { roll: 1, skillId: "GunCombat" },
        { roll: 2, skillId: "Communications" },
        { roll: 3, skillId: "ForwardObserver" },
        { roll: 4, skillId: "Vehicle" },
        { roll: 5, skillId: "SmallWatercraft" },
        { roll: 6, skillId: "SpecialCombat" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "LargeWatercraft" },
        { roll: 2, skillId: "Mechanical" },
        { roll: 3, skillId: "Electronics" },
        { roll: 4, skillId: "Gravitics" },
        { roll: 5, skillId: "Navigation" },
        { roll: 6, skillId: "Demolitions" },
      ],
    },
    {
      id: "advancedEducation8plus",
      name: "Advanced Education (Edu 8+)",
      minEdu: 8,
      entries: [
        { roll: 1, skillId: "Medical" },
        { roll: 2, skillId: "Vehicle" },
        { roll: 3, skillId: "Vice" },
        { roll: 4, skillId: "Technical" },
        { roll: 5, skillId: "Inborn" },
        { roll: 6, skillId: "Interpersonal" },
      ],
    },
  ],
  musteringOut: {
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "statBump", stat: "Int", amount: 1 } },
      { roll: 3, benefit: { kind: "weapon" } },
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
  draftSlot: 6,
};
