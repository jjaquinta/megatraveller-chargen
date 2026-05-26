/**
 * Navy career — Basic Character Generation.
 */

import type { CareerDef } from "../../engine/types";

export const NAVY: CareerDef = {
  id: "Navy",
  name: "Navy",
  enlistmentRestrictions: [
    {
      description: "Homeworld must be Pre-Stellar or higher (tech 7+)",
      matches: (h) => h.techLevel >= 7,
    },
  ],
  thresholds: {
    enlistment: {
      target: 8,
      dms: [
        { value: 1, condition: { stat: "Int", op: ">=", n: 8 } },
        { value: 2, condition: { stat: "Edu", op: ">=", n: 9 } },
      ],
    },
    survival: {
      target: 5,
      dms: [{ value: 2, condition: { stat: "Int", op: ">=", n: 7 } }],
    },
    commission: {
      target: 10,
      dms: [{ value: 1, condition: { stat: "Soc", op: ">=", n: 9 } }],
    },
    promotion: {
      target: 8,
      dms: [{ value: 1, condition: { stat: "Edu", op: ">=", n: 8 } }],
    },
    specialDuty: { target: 5, dms: [] },
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
        { roll: 5, skillId: "Mental" },
        { roll: 6, skillId: "Soc", statBump: "Soc" },
      ],
    },
    {
      id: "serviceSkills",
      name: "Service Skills",
      entries: [
        { roll: 1, skillId: "ShipsBoat" },
        { roll: 2, skillId: "VaccSuit" },
        { roll: 3, skillId: "ForwardObserver" },
        { roll: 4, skillId: "SpaceCombat" },
        { roll: 5, skillId: "HandCombat" },
        { roll: 6, skillId: "GunCombat" },
      ],
    },
    {
      id: "advancedEducation",
      name: "Advanced Education",
      entries: [
        { roll: 1, skillId: "VaccSuit" },
        { roll: 2, skillId: "Mechanical" },
        { roll: 3, skillId: "Electronics" },
        { roll: 4, skillId: "Space" },
        { roll: 5, skillId: "SpaceCombat" },
        { roll: 6, skillId: "Inborn" },
      ],
    },
    {
      id: "advancedEducation8plus",
      name: "Advanced Education (Edu 8+)",
      minEdu: 8,
      entries: [
        { roll: 1, skillId: "Medical" },
        { roll: 2, skillId: "Navigation" },
        { roll: 3, skillId: "SpaceTech" },
        { roll: 4, skillId: "Technical" },
        { roll: 5, skillId: "Space" },
        { roll: 6, skillId: "Interpersonal" },
      ],
    },
  ],
  musteringOut: {
    benefits: [
      { roll: 1, benefit: { kind: "lowPassage" } },
      { roll: 2, benefit: { kind: "statBump", stat: "Int", amount: 1 } },
      { roll: 3, benefit: { kind: "statBump", stat: "Edu", amount: 2 } },
      { roll: 4, benefit: { kind: "weapon" } },
      { roll: 5, benefit: { kind: "tasMembership" } },
      { roll: 6, benefit: { kind: "highPassage" } },
      { roll: 7, benefit: { kind: "statBump", stat: "Soc", amount: 2 } },
    ],
    cash: [
      { roll: 1, credits: 1000 },
      { roll: 2, credits: 5000 },
      { roll: 3, credits: 5000 },
      { roll: 4, credits: 10000 },
      { roll: 5, credits: 20000 },
      { roll: 6, credits: 50000 },
      { roll: 7, credits: 50000 },
    ],
  },
  skillsPerInitialTerm: 2,
  skillsPerSubsequentTerm: 1,
  canRetire: true,
  bypassesHomeworldSkillLimits: false,
  anagathicsSurvivalDm: -1,
  draftSlot: 1,
};
