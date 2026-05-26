/**
 * Belter career — Basic Character Generation.
 * Special: survival DM scales with terms served (engine handles via "belterTerms").
 * No commission/promotion. No retirement. No cash row 1-2.
 */

import type { CareerDef } from "../../engine/types";

export const BELTER: CareerDef = {
  id: "Belter",
  name: "Belter",
  enlistmentRestrictions: [],
  thresholds: {
    enlistment: {
      target: 8,
      dms: [
        { value: 1, condition: { stat: "Dex", op: ">=", n: 9 } },
        { value: 2, condition: { stat: "Int", op: ">=", n: 6 } },
      ],
    },
    survival: {
      // Base target. Engine adds +termNumber via specialDmRule.
      target: 9,
      dms: [],
      specialDmRule: "belterTerms",
    },
    commission: null,
    promotion: null,
    specialDuty: { target: 6, dms: [] },
    reenlist: { target: 6, dms: [] },
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
        { roll: 4, skillId: "Vice" },
        { roll: 5, skillId: "HandCombat" },
        { roll: 6, skillId: "VaccSuit" },
      ],
    },
    {
      id: "serviceSkills",
      name: "Service Skills",
      entries: [
        { roll: 1, skillId: "Space" },
        { roll: 2, skillId: "ZeroGEnviron" },
        { roll: 3, skillId: "GunCombat" },
        { roll: 4, skillId: "Prospecting" },
        { roll: 5, skillId: "Prospecting" },
        { roll: 6, skillId: "Space" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "ShipsBoat" },
        { roll: 2, skillId: "Mechanical" },
        { roll: 3, skillId: "Electronics" },
        { roll: 4, skillId: "Prospecting" },
        { roll: 5, skillId: "Exploratory" },
        { roll: 6, skillId: "Space" },
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
        { roll: 5, skillId: "Inborn" },
        { roll: 6, skillId: "SpaceTech" },
      ],
    },
  ],
  musteringOut: {
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "statBump", stat: "Int", amount: 1 } },
      { roll: 3, benefit: { kind: "weapon" } },
      { roll: 4, benefit: { kind: "highPassage" } },
      { roll: 5, benefit: { kind: "tasMembership" } },
      { roll: 6, benefit: { kind: "object", objectId: "seeker" } },
      { roll: 7, benefit: { kind: "none" } },
    ],
    cash: [
      { roll: 1, credits: 0 },
      { roll: 2, credits: 0 },
      { roll: 3, credits: 1000 },
      { roll: 4, credits: 10000 },
      { roll: 5, credits: 100000 },
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
