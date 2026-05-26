/**
 * Skill registry.
 *
 * Includes every skill referenced by basic character generation, plus cascade
 * parents and their children. Cascade parents are themselves skills (so they
 * can accumulate count before resolution); resolution swaps the parent count
 * for one or more child levels.
 *
 * Adding a new skill: append a new SkillDef entry below. If it's a cascade
 * parent, set isCascade and cascadeOptions. If it requires a homeworld tech
 * level, set minTechLevel.
 *
 * Adding a new cascade child: add the child here and reference it in the
 * parent's cascadeOptions. The data/index.ts validator will catch typos.
 */

import type { SkillDef, SkillId } from "../engine/types";

const skills: SkillDef[] = [
  // ----- Default level-0 skills (basic competencies) -----
  { id: "Brawling", name: "Brawling", isCascade: false, defaultLevel0: true },
  { id: "Computer", name: "Computer", isCascade: false, defaultLevel0: true },

  // ----- Plain skills (alphabetical) -----
  { id: "Admin", name: "Admin", isCascade: false },
  { id: "Bribery", name: "Bribery", isCascade: false },
  { id: "Carousing", name: "Carousing", isCascade: false },
  { id: "Communications", name: "Communications", isCascade: false },
  { id: "Demolitions", name: "Demolitions", isCascade: false },
  { id: "Disguise", name: "Disguise", isCascade: false },
  { id: "Electronics", name: "Electronics", isCascade: false },
  { id: "Engineering", name: "Engineering", isCascade: false },
  { id: "ForwardObserver", name: "Forward Observer", isCascade: false },
  { id: "Gambling", name: "Gambling", isCascade: false },
  { id: "GravBelt", name: "Grav Belt", isCascade: false, minTechLevel: 12 },
  { id: "GravVehicle", name: "Grav Vehicle", isCascade: false, minTechLevel: 9 },
  { id: "Hunting", name: "Hunting", isCascade: false },
  { id: "Instruction", name: "Instruction", isCascade: false },
  { id: "Interrogation", name: "Interrogation", isCascade: false },
  { id: "Intrusion", name: "Intrusion", isCascade: false },
  { id: "JackOfAllTrades", name: "Jack-of-all-Trades", isCascade: false },
  { id: "Leader", name: "Leader", isCascade: false },
  { id: "Liaison", name: "Liaison", isCascade: false },
  { id: "Linguistics", name: "Linguistics", isCascade: false },
  { id: "Mechanical", name: "Mechanical", isCascade: false },
  { id: "Medical", name: "Medical", isCascade: false },
  { id: "Navigation", name: "Navigation", isCascade: false },
  { id: "Pilot", name: "Pilot", isCascade: false },
  { id: "Prospecting", name: "Prospecting", isCascade: false },
  { id: "Recon", name: "Recon", isCascade: false },
  { id: "Recruiting", name: "Recruiting", isCascade: false },
  { id: "RobotOps", name: "Robot Ops", isCascade: false },
  { id: "SensorOps", name: "Sensor Ops", isCascade: false },
  { id: "ShipsBoat", name: "Ship's Boat", isCascade: false },
  { id: "Stealth", name: "Stealth", isCascade: false },
  { id: "Steward", name: "Steward", isCascade: false },
  { id: "Streetwise", name: "Streetwise", isCascade: false },
  { id: "Survey", name: "Survey", isCascade: false },
  { id: "Survival", name: "Survival", isCascade: false },
  { id: "Tactics", name: "Tactics", isCascade: false },
  { id: "Trader", name: "Trader", isCascade: false },
  { id: "TurretGunner", name: "Turret Gunner", isCascade: false },
  { id: "VaccSuit", name: "Vacc Suit", isCascade: false },
  { id: "ZeroGEnviron", name: "Zero-G Environ", isCascade: false },
  { id: "HighGEnviron", name: "High-G Environ", isCascade: false },
  { id: "Crossbow", name: "Crossbow", isCascade: false },
  { id: "Handgun", name: "Handgun", isCascade: false },
  { id: "Rifleman", name: "Rifleman", isCascade: false },
  { id: "Shotgun", name: "Shotgun", isCascade: false },
  { id: "AutoPistol", name: "Auto Pistol", isCascade: false },
  { id: "BodyPistol", name: "Body Pistol", isCascade: false },
  { id: "Revolver", name: "Revolver", isCascade: false },
  { id: "Carbine", name: "Carbine", isCascade: false },
  { id: "AutoRifle", name: "Auto Rifle", isCascade: false },
  { id: "Dagger", name: "Dagger", isCascade: false },
  { id: "Blade", name: "Blade", isCascade: false },
  { id: "Sword", name: "Sword", isCascade: false },
  { id: "Cudgel", name: "Cudgel", isCascade: false },
  { id: "LaserPistol", name: "Laser Pistol", isCascade: false },
  { id: "LaserRifle", name: "Laser Rifle", isCascade: false },
  { id: "SMG", name: "Submachinegun", isCascade: false },
  { id: "Karate", name: "Karate", isCascade: false },
  { id: "FAGunnery", name: "Field Artillery Gunnery", isCascade: false },
  { id: "HeavyWeapons", name: "Heavy Weapons", isCascade: false },
  { id: "BattleDress", name: "Battle Dress", isCascade: false, minTechLevel: 13 },
  { id: "CombatEngineering", name: "Combat Engineering", isCascade: false },
  { id: "NavalArchitect", name: "Naval Architect", isCascade: false },
  { id: "Gunnery", name: "Gunnery", isCascade: false },
  { id: "SpaceTech", name: "Space Tech", isCascade: false },
  { id: "Artisan", name: "Artisan", isCascade: false },
  { id: "Biology", name: "Biology", isCascade: false },
  { id: "Gravitics", name: "Gravitics", isCascade: false },
  { id: "ATV", name: "ATV", isCascade: false },

  // ----- New plain skills referenced in slice 3 careers -----
  { id: "Forensic", name: "Forensic", isCascade: false },
  { id: "Legal", name: "Legal", isCascade: false },
  { id: "Interview", name: "Interview", isCascade: false },
  { id: "ShipTactics", name: "Ship Tactics", isCascade: false },
  { id: "WheeledVehicle", name: "Wheeled Vehicle", isCascade: false },
  { id: "Broker", name: "Broker", isCascade: false },
  { id: "AnimalHandling", name: "Animal Handling", isCascade: false },
  { id: "History", name: "History", isCascade: false },
  { id: "Persuasion", name: "Persuasion", isCascade: false },
  { id: "Chemistry", name: "Chemistry", isCascade: false },
  { id: "Genetics", name: "Genetics", isCascade: false },
  { id: "Physics", name: "Physics", isCascade: false },
  { id: "Robotics", name: "Robotics", isCascade: false },
  { id: "Bow", name: "Bow", isCascade: false },
  { id: "Sling", name: "Sling", isCascade: false },
  { id: "Blowgun", name: "Blowgun", isCascade: false },
  { id: "Bola", name: "Bola", isCascade: false },
  { id: "Boomerang", name: "Boomerang", isCascade: false },
  { id: "EarlyFirearms", name: "Early Firearms", isCascade: false },
  { id: "Broadsword", name: "Broadsword", isCascade: false },
  { id: "Cutlass", name: "Cutlass", isCascade: false },
  { id: "TrackedVehicle", name: "Tracked Vehicle", isCascade: false },

  // ----- Cascade parents -----
  // Personal Development / Service Skills tables use these umbrella names;
  // the player picks a child at acquisition time (or banks for later).
  // For "Physical", "Mental", and "Inborn", the cascade options are
  // characteristic-stat bumps, handled specially in cascadeResolution.
  // Their cascadeOptions are left empty here so the data validator is happy.

  { id: "Physical", name: "Physical", isCascade: true, cascadeOptions: [] },
  { id: "Mental", name: "Mental", isCascade: true, cascadeOptions: [] },
  { id: "Inborn", name: "Inborn", isCascade: true, cascadeOptions: [] },

  {
    id: "Vice",
    name: "Vice",
    isCascade: true,
    cascadeOptions: ["Carousing", "Gambling", "Bribery"],
  },
  {
    id: "GunCombat",
    name: "Gun Combat",
    isCascade: true,
    cascadeOptions: [
      "AutoPistol",
      "BodyPistol",
      "Revolver",
      "Carbine",
      "Rifleman",
      "AutoRifle",
      "Shotgun",
      "SMG",
      "LaserPistol",
      "LaserRifle",
    ],
  },
  {
    id: "BladeCombat",
    name: "Blade Combat",
    isCascade: true,
    cascadeOptions: ["Dagger", "Blade", "Sword", "Cudgel"],
  },
  {
    id: "HandCombat",
    name: "Hand Combat",
    isCascade: true,
    cascadeOptions: ["Brawling", "Karate"],
  },
  {
    id: "Vehicle",
    name: "Vehicle",
    isCascade: true,
    cascadeOptions: ["GravVehicle", "ATV", "WheeledVehicle", "TrackedVehicle"],
  },
  {
    id: "SpaceCombat",
    name: "Space Combat",
    isCascade: true,
    cascadeOptions: ["Gunnery", "ShipsBoat", "ShipTactics"],
  },
  {
    id: "Space",
    name: "Space",
    isCascade: true,
    cascadeOptions: ["Pilot", "Navigation", "Engineering", "ShipsBoat"],
  },
  {
    id: "Technical",
    name: "Technical",
    isCascade: true,
    cascadeOptions: ["Electronics", "Mechanical", "Gravitics", "Computer"],
  },
  {
    id: "Interpersonal",
    name: "Interpersonal",
    isCascade: true,
    cascadeOptions: ["Admin", "Leader", "Liaison", "Carousing", "Streetwise"],
  },
  {
    id: "SpecialCombat",
    name: "Special Combat",
    isCascade: true,
    cascadeOptions: ["HeavyWeapons", "BattleDress"],
  },

  // Slice 3: additional cascades for the broader career mix.
  {
    id: "Environ",
    name: "Environ",
    isCascade: true,
    cascadeOptions: ["AnimalHandling", "ArchaicWeapons", "Hunting", "Recon", "Survival", "Stealth"],
  },
  {
    id: "Economic",
    name: "Economic",
    isCascade: true,
    cascadeOptions: ["Admin", "Broker", "Legal", "Trader"],
  },
  {
    id: "Science",
    name: "Science",
    isCascade: true,
    cascadeOptions: ["Biology", "Chemistry", "Genetics", "Forensic", "Medical", "Physics", "Robotics"],
  },
  {
    id: "Exploratory",
    name: "Exploratory",
    isCascade: true,
    cascadeOptions: ["Pilot", "SensorOps", "Survey", "Survival", "VaccSuit", "Vehicle"],
  },
  {
    id: "Academic",
    name: "Academic",
    isCascade: true,
    // The book lists "+1 Edu" as one of the options. We model that by
    // including "Edu" in the cascade options; cascadeResolution treats any
    // characteristic name as a stat bump (same path as Mental / Inborn).
    cascadeOptions: ["Admin", "History", "Linguistics", "Persuasion", "Science", "Edu"],
  },
  {
    id: "ArchaicWeapons",
    name: "Archaic Weapons",
    isCascade: true,
    cascadeOptions: ["Blowgun", "Bola", "Boomerang", "Bow", "Crossbow", "EarlyFirearms", "Sling"],
  },
  {
    id: "LargeBlade",
    name: "Large Blade",
    isCascade: true,
    cascadeOptions: ["Broadsword", "Cutlass", "Sword"],
  },
  {
    id: "Aircraft",
    name: "Aircraft",
    isCascade: true,
    cascadeOptions: [],
  },
  {
    id: "SmallWatercraft",
    name: "Small Watercraft",
    isCascade: true,
    cascadeOptions: [],
  },
  {
    id: "LargeWatercraft",
    name: "Large Watercraft",
    isCascade: true,
    cascadeOptions: [],
  },
];

export const SKILL_REGISTRY: ReadonlyMap<SkillId, SkillDef> = new Map(
  skills.map((s) => [s.id, s]),
);

export function getSkill(id: SkillId): SkillDef {
  const s = SKILL_REGISTRY.get(id);
  if (!s) throw new Error(`Unknown skill: ${id}`);
  return s;
}

export function allSkills(): readonly SkillDef[] {
  return skills;
}
