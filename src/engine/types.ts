/**
 * Domain types for MegaTraveller character generation.
 *
 * Naming convention: types ending in "Def" describe immutable rule data
 * (loaded from the data/ tree). Types without that suffix are character
 * state, mutated by the engine.
 */

// ============================================================================
// Identity
// ============================================================================

export type CharacterId = string;
export type CareerId = string;
export type SkillId = string;
export type RaceId = string; // "Human" for now; nonhumans later

// ============================================================================
// Characteristics and UPP
// ============================================================================

export type CharacteristicName = "Str" | "Dex" | "End" | "Int" | "Edu" | "Soc";

export const CHARACTERISTIC_ORDER: readonly CharacteristicName[] = [
  "Str",
  "Dex",
  "End",
  "Int",
  "Edu",
  "Soc",
] as const;

/**
 * Six characteristic values. Values are kept as numbers (0–15) internally;
 * hex encoding is a display concern handled in upp.ts.
 */
export type UPP = Record<CharacteristicName, number>;

// ============================================================================
// Homeworld
// ============================================================================

/**
 * Homeworld code stored as the seven-digit Universal World Profile code.
 * Each field is the raw numeric value (or hex 0-F) read from the homeworld
 * code tables.
 */
export interface Homeworld {
  starport: string; // A–E or X
  size: number; // 0–10 (0 = asteroid)
  atmosphere: number; // 0–15
  hydrographics: number; // 0–10
  population: number; // 0–10
  lawLevel: number; // 0–9
  techLevel: number; // 0–15
}

// ============================================================================
// DM rules (data-driven attribute checks for die-roll modifiers)
// ============================================================================

export type AttrOp = ">=" | "<=";

export interface AttrCondition {
  stat: CharacteristicName;
  op: AttrOp;
  n: number;
}

export interface DMRule {
  value: number;
  condition: AttrCondition;
}

export interface ThresholdDef {
  target: number; // 2D roll must equal or exceed this
  dms: DMRule[];
  /** Named special-case DM logic that lives in engine code, not data. */
  specialDmRule?: "belterTerms";
}

// ============================================================================
// Skills
// ============================================================================

/**
 * A skill entry in the registry. Cascade skills are "umbrella" skills like
 * "Gun Combat" that resolve into a specific child skill. The cascade parent
 * itself is also a SkillDef so it can accumulate counts before resolution.
 */
export interface SkillDef {
  id: SkillId;
  name: string;
  /** If true, this is a cascade parent that resolves to one of `cascadeOptions`. */
  isCascade: boolean;
  /** Child skill ids — only meaningful when isCascade is true. */
  cascadeOptions?: SkillId[];
  /** Minimum homeworld tech level required (homeworld limit rule). */
  minTechLevel?: number;
  /** If true, characters default to level 0 in this skill. */
  defaultLevel0?: boolean;
}

// ============================================================================
// Careers
// ============================================================================

/** Entry on an Acquired Skills table: rolling this die value yields this skill. */
export interface SkillTableEntry {
  roll: number; // 1–6
  skillId: SkillId;
  /** If the skill is a stat bump (+1 Dex, +1 End, ...), record the stat instead. */
  statBump?: CharacteristicName;
}

export type SkillTableId =
  | "personalDevelopment"
  | "serviceSkills"
  | "advancedEducation"
  | "advancedEducation8plus";

export interface SkillTable {
  id: SkillTableId;
  name: string;
  /** Six entries, indexed by the 1d6 roll. */
  entries: SkillTableEntry[];
  /** If set, the character needs at least this Edu to roll on this table. */
  minEdu?: number;
}

export type RankDef = string;

/** A condition on the homeworld for enlistment eligibility. */
export interface HomeworldRestriction {
  description: string;
  /** Simple predicate so we don't need a mini-DSL in data. */
  matches: (h: Homeworld) => boolean;
}

/**
 * Mustering-out tables. Each table has six entries indexed by 1D, plus an
 * optional 7th entry that becomes reachable when the character has rank 5+
 * (which grants +1 to benefit rolls) or +1 cash DM from Gambling/Prospecting
 * or retirement.
 */
export interface BenefitEntry {
  roll: number; // 1-7; 7 is the rank-5/6 bonus row
  benefit: BenefitOutcome;
}

export interface CashEntry {
  roll: number; // 1-7
  credits: number;
}

export type BenefitOutcome =
  | { kind: "lowPassage" }
  | { kind: "midPassage" }
  | { kind: "highPassage" }
  | { kind: "statBump"; stat: CharacteristicName; amount: number }
  | { kind: "weapon" }
  | { kind: "tasMembership" }
  | { kind: "object"; objectId: string } // catalog lookup
  | { kind: "none" }; // for the Scout row 7 ("—")

export interface CareerDef {
  id: CareerId;
  name: string;
  enlistmentRestrictions: HomeworldRestriction[];

  thresholds: {
    enlistment: ThresholdDef;
    survival: ThresholdDef;
    commission: ThresholdDef | null; // null = no commissions in this career
    promotion: ThresholdDef | null;
    specialDuty: ThresholdDef;
    reenlist: ThresholdDef;
  };

  ranks: RankDef[]; // empty array = no ranks (Scouts, civilians without commissions)

  acquiredSkillTables: SkillTable[]; // 4 tables; the Edu 8+ one carries minEdu

  musteringOut: {
    benefits: BenefitEntry[]; // 6 entries
    cash: CashEntry[]; // 6 entries
  };

  skillsPerInitialTerm: number; // usually 2
  skillsPerSubsequentTerm: number; // usually 1; 2 for Scouts, Doctors, Scientists

  canRetire: boolean;
  bypassesHomeworldSkillLimits: boolean; // true for Noble only
  anagathicsSurvivalDm: number; // -1 normally, -2 for Noble

  /** If true, a successful reenlistment throw is mandatory — no choice to leave. */
  mandatoryReenlistOnSuccess?: boolean;

  /** Optional draftable slot (1–6 on the draft die). */
  draftSlot?: number;
}

// ============================================================================
// Decisions — the engine pauses with one of these when it needs input
// ============================================================================

export type DecisionRequest =
  | {
      kind: "chooseIdentity";
    }
  | {
      kind: "chooseCareer";
      reason: "initial" | "afterMusterOut";
      options: CareerId[];
    }
  | {
      kind: "acceptDraft";
      assigned: CareerId;
    }
  | {
      kind: "chooseSkillTable";
      allowed: SkillTableId[];
      remaining: number; // how many skill rolls left this term
    }
  | {
      kind: "resolveCascade";
      parent: SkillId;
      options: SkillId[];
      mayDefer: boolean;
      currentLevels: Record<SkillId, number>;
    }
  | {
      kind: "anagathicsUse";
      currentlyUsing: boolean;
      hasSupply: boolean;
      apparentAge: number;
      actualAge: number;
    }
  | {
      kind: "reenlist";
      mandatoryIfRolled12: true;
      mayChoose: boolean; // false on mandatory; true otherwise
    }
  | {
      kind: "musterOutTableChoice";
      remainingRolls: number;
      cashRollsUsed: number;
      cashLimit: number;
    }
  | {
      kind: "chooseWeapon";
      /** When mustering-out grants a weapon, the player picks any in-tech, in-law one. */
      availableWeapons: SkillId[];
      /** Weapons already received as benefits — the player can stack skill in those. */
      alreadyOwned: SkillId[];
    }
  | {
      kind: "agingSavedCharacteristics";
      /** When on anagathics, pick which characteristics auto-save. Two for normal lines; for age 66+ still two. */
      options: CharacteristicName[];
      count: number;
    };

export type Decision =
  | { kind: "chooseIdentity"; name: string; gender: string; race: RaceId; homeworld: Homeworld }
  | { kind: "chooseCareer"; careerId: CareerId }
  | { kind: "acceptDraft"; accept: boolean }
  | { kind: "chooseSkillTable"; tableId: SkillTableId }
  | { kind: "resolveCascade"; choice: { kind: "specific"; child: SkillId } | { kind: "defer" } }
  | { kind: "anagathicsUse"; use: boolean }
  | { kind: "reenlist"; reenlist: boolean }
  | { kind: "musterOutTableChoice"; table: "benefits" | "cash" }
  | { kind: "chooseWeapon"; choice: { kind: "new"; weapon: SkillId } | { kind: "stack"; weapon: SkillId } }
  | { kind: "agingSavedCharacteristics"; chosen: CharacteristicName[] };

// ============================================================================
// Engine result
// ============================================================================

export type GenerationResult =
  | { kind: "needDecision"; decision: DecisionRequest; character: Character }
  | { kind: "done"; character: Character };

/**
 * Internal phase result. Phase handlers return one of these; advance()
 * loops on "continue" so the engine only pauses on a true decision point.
 */
export type PhaseResult =
  | { kind: "needDecision"; decision: DecisionRequest; character: Character }
  | { kind: "continue"; character: Character }
  | { kind: "done"; character: Character };

// ============================================================================
// Log
// ============================================================================

export interface LogEntry {
  term: number; // 0 = pre-career
  text: string;
}

// ============================================================================
// Anagathics state
// ============================================================================

export interface AnagathicsState {
  using: boolean;
  hasSupply: boolean;
  apparentAge: number | null; // null = not on anagathics
  cashRollLimit: 3 | 2; // permanently reduced to 2 once anagathics taken
}

// ============================================================================
// Possessions
// ============================================================================

export interface Possession {
  description: string;
  /** Catalog id, if the object came from the benefit-objects table. */
  objectId?: string;
}

export interface PassageHolding {
  high: number;
  middle: number;
  low: number;
}

// ============================================================================
// Manual edits
// ============================================================================

export type ManualEdit =
  | { kind: "setName"; name: string }
  | { kind: "setUPP"; stat: CharacteristicName; value: number }
  | { kind: "setSkill"; skillId: SkillId; level: number }
  | { kind: "setCash"; cash: number }
  | { kind: "setRetirementPay"; perYear: number }
  | { kind: "setAge"; age: number }
  | { kind: "addPossession"; possession: Possession }
  | { kind: "removePossession"; index: number };

// ============================================================================
// Generation control
// ============================================================================

export type GenPhase =
  | "identity"
  | "chooseCareer"
  | "enlistment"
  | "term"
  | "reenlist"
  | "musterOut"
  | "cascadeResolution"
  | "done";

export interface GenerationState {
  phase: GenPhase;
  termNumber: number; // 1-based; 0 before first term
  pendingDecision: DecisionRequest | null;

  /**
   * Per-term scratch state. Cleared between terms. Holds things like
   * remaining skill rolls, whether commission/promotion succeeded etc.
   */
  termScratch: TermScratch | null;

  /** Scratch state during mustering out — sequence of benefit/cash rolls. */
  musterOutScratch: MusterOutScratch | null;

  /** Cumulative pending cascade resolutions, swept at end of generation. */
  pendingCascades: SkillId[];

  /** Apparent age (Aging Table line) tracked separately for anagathics. */
  apparentAge: number;

  /** Term count that contributes to retirement / muster-out roll budget (anagathics terms excluded). */
  qualifyingTerms: number;
}

export interface TermScratch {
  /** Whether the term's survival roll has succeeded. False = mustering out forced. */
  survived: boolean;
  /** Whether commission was attempted/succeeded this term. */
  commissionAttempted: boolean;
  commissioned: boolean;
  promoted: boolean;
  specialDuty: boolean;
  /** Skill rolls earned this term but not yet rolled. */
  skillRollsRemaining: number;
  /** Whether the player chose to take anagathics this term (queried before survival). */
  anagathicsChosen: boolean;
  /** Whether anagathics was offered/decided this term. */
  anagathicsDecided: boolean;
  /** Whether aging has been processed for this term. */
  agingResolved: boolean;
}

export interface MusterOutScratch {
  totalRolls: number;
  rollsUsed: number;
  cashRollsUsed: number;
  cashLimit: 2 | 3;
  /** +1 to benefits if rank 5/6; +1 to cash if Gambling-1+/Prospecting-1+/retired. */
  benefitDM: number;
  cashDM: number;
  /** Weapons received so far (so the next "weapon" benefit can stack). */
  weaponsReceived: SkillId[];
  /** Whether TAS membership already received (only once). */
  tasReceived: boolean;
  /** Whether scout ship already received (only once per book). */
  scoutShipReceived: boolean;
}

// ============================================================================
// Character
// ============================================================================

export interface Character {
  id: CharacterId;
  name: string;
  gender: string;
  race: RaceId;

  upp: UPP;
  homeworld: Homeworld | null;
  age: number; // 18 at character creation; +4 per term

  career: CareerId | null;
  terms: number; // completed terms (full terms only)
  rank: number; // 0 = enlisted/no rank; higher = ranks[rank-1]

  skills: Map<SkillId, number>;
  possessions: Possession[];
  cash: number;
  passages: PassageHolding;
  decorations: string[]; // free-form for now: "MCUF", "MCG", "SEH", "Purple Heart"
  brownie: number;
  anagathics: AnagathicsState;
  retirementPay: number; // per-year credits, 0 if not retired

  log: LogEntry[];

  generation: GenerationState;
  edits: ManualEdit[];

  /** RNG seed used at generation start. */
  seed: string;

  schemaVersion: number;
}
