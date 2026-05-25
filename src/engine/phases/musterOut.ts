/**
 * Mustering-out phase.
 *
 * Resolves the character's mustering-out rolls. Each roll:
 *   1. Player chooses benefits or cash table.
 *   2. Roll 1D + DMs.
 *   3. Apply the result (cash adds credits; benefit applies via applyBenefit).
 *   4. If the benefit is a weapon, pause for chooseWeapon decision.
 *
 * Roll budget:
 *   - 1 per qualifying full term (excludes anagathics-term half-credit and
 *     failed-survival half-terms).
 *   - +1 extra if rank 1 or 2; +2 if rank 3 or 4; +3 if rank 5 or 6.
 *   - Rank 5/6 also adds +1 DM to benefit rolls.
 *   - Gambling-1+ / Prospecting-1+ / retired adds +1 DM to cash rolls.
 *
 * Cash table limit: max 3 (default) or 2 (if ever took anagathics).
 *
 * Retirement: if canRetire and qualifyingTerms >= 5, retirementPay =
 * Cr2000 * qualifyingTerms.
 *
 * After all rolls are spent, transition to cascadeResolution.
 */

import type { RNG } from "../rng";
import type {
  CareerDef,
  Character,
  Decision,
  DecisionRequest,
  MusterOutScratch,
  PhaseResult,
  SkillId,
} from "../types";
import { appendLog } from "../log";
import { getCareer } from "../../data";
import { applyBenefit, rollBenefitTable, rollCashTable } from "../rules/benefits";

const ALL_WEAPONS: SkillId[] = [
  "AutoPistol", "BodyPistol", "Revolver", "Carbine", "Rifleman",
  "AutoRifle", "Shotgun", "SMG", "LaserPistol", "LaserRifle",
  "Dagger", "Blade", "Sword", "Cudgel",
];

export function handleMusterOut(
  character: Character,
  decision: Decision | undefined,
  rng: RNG,
): PhaseResult {
  if (!character.career) {
    // Failed initial enlistment with no career; mark done.
    return { kind: "done", character: { ...character, generation: { ...character.generation, phase: "done", pendingDecision: null } } };
  }
  const career = getCareer(character.career);

  // Initialize scratch on first entry.
  let scratch = character.generation.musterOutScratch;
  let updated = character;
  if (!scratch) {
    scratch = initScratch(updated, career);
    updated = applyRetirementPay(updated, career, scratch);
    updated = {
      ...updated,
      generation: { ...updated.generation, musterOutScratch: scratch },
    };
    updated = appendLog(
      updated,
      `Mustering out: ${scratch.totalRolls} rolls (cash table cap ${scratch.cashLimit}).`,
    );
  }

  // Process incoming decisions first.
  if (character.generation.pendingDecision?.kind === "musterOutTableChoice" && decision) {
    if (decision.kind !== "musterOutTableChoice") throw new Error("Expected musterOutTableChoice");
    return rollOneBenefit(updated, career, decision.table, rng);
  }

  if (character.generation.pendingDecision?.kind === "chooseWeapon" && decision) {
    if (decision.kind !== "chooseWeapon") throw new Error("Expected chooseWeapon");
    return applyWeaponChoice(updated, decision);
  }

  // Out of rolls? Done.
  if (scratch.rollsUsed >= scratch.totalRolls) {
    return {
      kind: "continue",
      character: {
        ...updated,
        generation: {
          ...updated.generation,
          phase: "cascadeResolution",
          pendingDecision: null,
          musterOutScratch: null,
        },
      },
    };
  }

  // Otherwise ask for the next table choice.
  const request: DecisionRequest = {
    kind: "musterOutTableChoice",
    remainingRolls: scratch.totalRolls - scratch.rollsUsed,
    cashRollsUsed: scratch.cashRollsUsed,
    cashLimit: scratch.cashLimit,
  };
  return {
    kind: "needDecision",
    decision: request,
    character: {
      ...updated,
      generation: { ...updated.generation, pendingDecision: request },
    },
  };
}

function initScratch(character: Character, career: CareerDef): MusterOutScratch {
  let total = character.generation.qualifyingTerms;
  // Rank-based bonus rolls
  if (character.rank >= 1 && character.rank <= 2) total += 1;
  else if (character.rank >= 3 && character.rank <= 4) total += 2;
  else if (character.rank >= 5) total += 3;

  const benefitDM = character.rank >= 5 ? 1 : 0;
  let cashDM = 0;
  if ((character.skills.get("Gambling") ?? 0) >= 1) cashDM = 1;
  else if ((character.skills.get("Prospecting") ?? 0) >= 1) cashDM = 1;
  // Retired (5+ terms in a career that allows retirement) gives +1 cash DM.
  if (career.canRetire && character.generation.qualifyingTerms >= 5) cashDM = 1;

  return {
    totalRolls: total,
    rollsUsed: 0,
    cashRollsUsed: 0,
    cashLimit: character.anagathics.cashRollLimit,
    benefitDM,
    cashDM,
    weaponsReceived: [],
    tasReceived: false,
    scoutShipReceived: false,
  };
}

function applyRetirementPay(character: Character, career: CareerDef, scratch: MusterOutScratch): Character {
  if (!career.canRetire) return character;
  if (scratch.totalRolls < 5 && character.generation.qualifyingTerms < 5) return character;
  // Cr2000 * qualifyingTerms (anagathics terms excluded from qualifyingTerms already).
  if (character.generation.qualifyingTerms < 5) return character;
  const pay = 2000 * character.generation.qualifyingTerms;
  const updated = { ...character, retirementPay: pay };
  return appendLog(updated, `Retired with Cr${pay} per year pension.`);
}

function rollOneBenefit(
  character: Character,
  career: CareerDef,
  table: "benefits" | "cash",
  rng: RNG,
): PhaseResult {
  const scratch = character.generation.musterOutScratch!;
  let updated = character;

  if (table === "cash") {
    if (scratch.cashRollsUsed >= scratch.cashLimit) {
      // Should not happen if the UI honors the limit; treat as a no-op.
      const reissued: DecisionRequest = {
        kind: "musterOutTableChoice",
        remainingRolls: scratch.totalRolls - scratch.rollsUsed,
        cashRollsUsed: scratch.cashRollsUsed,
        cashLimit: scratch.cashLimit,
      };
      return {
        kind: "needDecision",
        decision: reissued,
        character: { ...character, generation: { ...character.generation, pendingDecision: reissued } },
      };
    }
    const { face, effective } = rollCashTable(rng, scratch.cashDM);
    const entry = career.musteringOut.cash.find((e) => e.roll === effective);
    if (!entry) throw new Error(`Cash entry not found for effective roll ${effective}`);
    updated = appendLog(
      { ...updated, cash: updated.cash + entry.credits },
      `Cash table: rolled ${face}${scratch.cashDM ? `+${scratch.cashDM}` : ""} → Cr${entry.credits}.`,
    );
    const newScratch: MusterOutScratch = {
      ...scratch,
      rollsUsed: scratch.rollsUsed + 1,
      cashRollsUsed: scratch.cashRollsUsed + 1,
    };
    return {
      kind: "continue",
      character: {
        ...updated,
        generation: { ...updated.generation, musterOutScratch: newScratch, pendingDecision: null },
      },
    };
  }

  // benefits
  const { face, effective } = rollBenefitTable(rng, scratch.benefitDM);
  const entry = career.musteringOut.benefits.find((e) => e.roll === effective);
  if (!entry) throw new Error(`Benefit entry not found for effective roll ${effective}`);

  updated = appendLog(
    updated,
    `Benefits table: rolled ${face}${scratch.benefitDM ? `+${scratch.benefitDM}` : ""}.`,
  );

  const { character: afterBenefit, pendingWeapon } = applyBenefit(updated, entry.benefit, scratch);
  updated = afterBenefit;

  // Track flags
  let newScratch: MusterOutScratch = { ...scratch, rollsUsed: scratch.rollsUsed + 1 };
  if (entry.benefit.kind === "tasMembership") newScratch = { ...newScratch, tasReceived: true };
  if (entry.benefit.kind === "object" && entry.benefit.objectId === "scoutShip") {
    newScratch = { ...newScratch, scoutShipReceived: true };
  }

  if (pendingWeapon) {
    // Issue chooseWeapon and pause.
    const request: DecisionRequest = {
      kind: "chooseWeapon",
      availableWeapons: ALL_WEAPONS,
      alreadyOwned: scratch.weaponsReceived,
    };
    return {
      kind: "needDecision",
      decision: request,
      character: {
        ...updated,
        generation: {
          ...updated.generation,
          musterOutScratch: newScratch,
          pendingDecision: request,
        },
      },
    };
  }

  return {
    kind: "continue",
    character: {
      ...updated,
      generation: {
        ...updated.generation,
        musterOutScratch: newScratch,
        pendingDecision: null,
      },
    },
  };
}

function applyWeaponChoice(character: Character, decision: Decision): PhaseResult {
  if (decision.kind !== "chooseWeapon") throw new Error("Expected chooseWeapon");
  const scratch = character.generation.musterOutScratch!;
  let updated = character;

  if (decision.choice.kind === "new") {
    const weapon = decision.choice.weapon;
    updated = {
      ...updated,
      possessions: [...updated.possessions, { description: weapon }],
    };
    updated = appendLog(updated, `Received weapon: ${weapon}.`);
    const newScratch = { ...scratch, weaponsReceived: [...scratch.weaponsReceived, weapon] };
    return {
      kind: "continue",
      character: {
        ...updated,
        generation: { ...updated.generation, pendingDecision: null, musterOutScratch: newScratch },
      },
    };
  }

  // stack
  const weapon = decision.choice.weapon;
  const current = updated.skills.get(weapon) ?? 0;
  const newSkills = new Map(updated.skills);
  newSkills.set(weapon, current + 1);
  updated = { ...updated, skills: newSkills };
  updated = appendLog(updated, `Stacked weapon skill: ${weapon}-${current + 1}.`);
  return {
    kind: "continue",
    character: {
      ...updated,
      generation: { ...updated.generation, pendingDecision: null },
    },
  };
}
