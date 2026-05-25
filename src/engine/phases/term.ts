/**
 * Term phase: survival → commission → promotion → special duty → skills.
 *
 * This handler is called many times during a term — each call advances by
 * the smallest possible step. State within the term lives in
 * character.generation.termScratch.
 *
 * For Scouts (no commission, no promotion) the commission/promotion steps
 * short-circuit.
 *
 * Skills are handled by pausing for chooseSkillTable, rolling on the chosen
 * table, banking the result (incrementing the skill or its cascade parent),
 * and decrementing skillRollsRemaining. When skillRollsRemaining hits zero
 * the term concludes (aging then reenlist; for v1 we go straight to
 * reenlist).
 */

import { roll1d, roll2d } from "../dice";
import type { RNG } from "../rng";
import type {
  CareerDef,
  Character,
  Decision,
  DecisionRequest,
  PhaseResult,
  TermScratch,
} from "../types";
import { appendLog } from "../log";
import { evaluateDMs } from "../rules/dmRules";
import { eligibleSkillTables, getSkillTable } from "../rules/skillTables";
import { getCareer } from "../../data";
import { getSkill } from "../../data/skills";
import { applyDelta } from "../upp";

export function handleTerm(
  character: Character,
  decision: Decision | undefined,
  rng: RNG,
): PhaseResult {
  if (!character.career) throw new Error("term with no career");
  const career = getCareer(character.career);
  let scratch = character.generation.termScratch;
  if (!scratch) throw new Error("term phase with no scratch state");

  // Step 1: survival. Resolved automatically (no decision required).
  if (!scratch.survived) {
    return rollSurvival(character, career, rng);
  }

  // Step 2: commission (if eligible and not yet attempted).
  if (career.thresholds.commission !== null && !scratch.commissionAttempted && character.rank === 0) {
    return rollCommission(character, career, rng);
  }

  // Step 3: promotion (if has rank and hasn't been promoted yet this term).
  if (career.thresholds.promotion !== null && character.rank > 0 && !scratch.promoted) {
    return rollPromotion(character, career, rng);
  }

  // Step 4: special duty.
  if (!scratch.specialDuty && !character.generation.pendingDecision) {
    return rollSpecialDuty(character, career, rng);
  }

  // Step 5: skills. May pause for chooseSkillTable.
  if (scratch.skillRollsRemaining > 0) {
    return handleSkillRoll(character, career, decision, rng);
  }

  // Term complete. Advance to reenlist.
  const aged = appendLog({ ...character, age: character.age + 4 }, `End of term ${character.generation.termNumber}; age ${character.age + 4}.`);
  return {
    kind: "continue",
    character: {
      ...aged,
      terms: aged.generation.termNumber,
      generation: {
        ...aged.generation,
        phase: "reenlist",
        pendingDecision: null,
        termScratch: null,
      },
    },
  };
}

function rollSurvival(character: Character, career: CareerDef, rng: RNG): PhaseResult {
  const dms = evaluateDMs(career.thresholds.survival.dms, character);
  const roll = roll2d(rng, dms);
  const survived = roll.effective >= career.thresholds.survival.target;
  const scratch: TermScratch = { ...character.generation.termScratch!, survived };

  if (survived) {
    const updated = appendLog(
      character,
      `Survived term ${character.generation.termNumber} (rolled ${roll.total}${dms ? `+${dms}` : ""} vs ${career.thresholds.survival.target}+).`,
    );
    return {
      kind: "continue",
      character: {
        ...updated,
        generation: { ...updated.generation, termScratch: scratch },
      },
    };
  }

  // Failed survival: optional rule says death; default rule says mustered out
  // after two years. We take the default. Term doesn't count for benefits, so
  // we don't bump terms. Bump age by 2 instead of 4. Go to musterOut.
  const updated = appendLog(
    { ...character, age: character.age + 2 },
    `Failed survival in term ${character.generation.termNumber}. Mustered out early.`,
  );
  return {
    kind: "continue",
    character: {
      ...updated,
      generation: {
        ...updated.generation,
        phase: "musterOut",
        pendingDecision: null,
        termScratch: null,
      },
    },
  };
}

function rollCommission(character: Character, career: CareerDef, rng: RNG): PhaseResult {
  const t = career.thresholds.commission!;
  const dms = evaluateDMs(t.dms, character);
  const roll = roll2d(rng, dms);
  const success = roll.effective >= t.target;
  const scratch: TermScratch = {
    ...character.generation.termScratch!,
    commissionAttempted: true,
    commissioned: success,
    skillRollsRemaining: character.generation.termScratch!.skillRollsRemaining + (success ? 1 : 0),
  };
  const updated = appendLog(
    success
      ? { ...character, rank: 1 }
      : character,
    success
      ? `Commissioned (rolled ${roll.total}${dms ? `+${dms}` : ""} vs ${t.target}+).`
      : `Failed commission (rolled ${roll.total}${dms ? `+${dms}` : ""} vs ${t.target}+).`,
  );
  return {
    kind: "continue",
    character: { ...updated, generation: { ...updated.generation, termScratch: scratch } },
  };
}

function rollPromotion(character: Character, career: CareerDef, rng: RNG): PhaseResult {
  const t = career.thresholds.promotion!;
  const dms = evaluateDMs(t.dms, character);
  const roll = roll2d(rng, dms);
  const success = roll.effective >= t.target;
  const newRank = success ? Math.min(character.rank + 1, career.ranks.length) : character.rank;
  const scratch: TermScratch = {
    ...character.generation.termScratch!,
    promoted: true,
    skillRollsRemaining: character.generation.termScratch!.skillRollsRemaining + (success ? 1 : 0),
  };
  const updated = appendLog(
    success ? { ...character, rank: newRank } : character,
    success
      ? `Promoted to rank ${newRank} (rolled ${roll.total}${dms ? `+${dms}` : ""} vs ${t.target}+).`
      : `Did not promote (rolled ${roll.total}${dms ? `+${dms}` : ""} vs ${t.target}+).`,
  );
  return {
    kind: "continue",
    character: { ...updated, generation: { ...updated.generation, termScratch: scratch } },
  };
}

function rollSpecialDuty(character: Character, career: CareerDef, rng: RNG): PhaseResult {
  const t = career.thresholds.specialDuty;
  const dms = evaluateDMs(t.dms, character);
  const roll = roll2d(rng, dms);
  const success = roll.effective >= t.target;
  const scratch: TermScratch = {
    ...character.generation.termScratch!,
    specialDuty: true,
    skillRollsRemaining: character.generation.termScratch!.skillRollsRemaining + (success ? 1 : 0),
  };
  const updated = appendLog(
    character,
    success
      ? `Special duty earned (+1 skill) (rolled ${roll.total}${dms ? `+${dms}` : ""} vs ${t.target}+).`
      : `No special duty (rolled ${roll.total}${dms ? `+${dms}` : ""} vs ${t.target}+).`,
  );
  return {
    kind: "continue",
    character: { ...updated, generation: { ...updated.generation, termScratch: scratch } },
  };
}

function handleSkillRoll(
  character: Character,
  career: CareerDef,
  decision: Decision | undefined,
  rng: RNG,
): PhaseResult {
  // If we're waiting for a table choice, ask for it.
  if (character.generation.pendingDecision === null) {
    const allowed = eligibleSkillTables(career, character);
    const request: DecisionRequest = {
      kind: "chooseSkillTable",
      allowed,
      remaining: character.generation.termScratch!.skillRollsRemaining,
    };
    return {
      kind: "needDecision",
      decision: request,
      character: {
        ...character,
        generation: { ...character.generation, pendingDecision: request },
      },
    };
  }

  if (!decision || decision.kind !== "chooseSkillTable") {
    throw new Error("Expected chooseSkillTable decision");
  }

  const table = getSkillTable(career, decision.tableId);
  const die = roll1d(rng);
  const entry = table.entries.find((e) => e.roll === die);
  if (!entry) throw new Error(`Skill table ${decision.tableId} has no entry for roll ${die}`);

  // Apply the skill: either a stat bump or a skill increment.
  let updated = character;
  if (entry.statBump) {
    updated = {
      ...updated,
      upp: applyDelta(updated.upp, entry.statBump, 1),
    };
    updated = appendLog(updated, `Studied on the ${table.name} table (rolled ${die}): +1 ${entry.statBump}.`);
  } else {
    const skill = getSkill(entry.skillId);
    const current = updated.skills.get(skill.id) ?? 0;
    const newSkills = new Map(updated.skills);
    newSkills.set(skill.id, current + 1);
    updated = { ...updated, skills: newSkills };
    if (skill.isCascade) {
      // Track as a pending cascade so it gets resolved at end of gen if not earlier.
      const pending = updated.generation.pendingCascades.includes(skill.id)
        ? updated.generation.pendingCascades
        : [...updated.generation.pendingCascades, skill.id];
      updated = {
        ...updated,
        generation: { ...updated.generation, pendingCascades: pending },
      };
      updated = appendLog(updated, `Studied on the ${table.name} table (rolled ${die}): banked ${skill.name} (to resolve later).`);
    } else {
      updated = appendLog(updated, `Studied on the ${table.name} table (rolled ${die}): ${skill.name}-${current + 1}.`);
    }
  }

  const scratch = updated.generation.termScratch!;
  return {
    kind: "continue",
    character: {
      ...updated,
      generation: {
        ...updated.generation,
        pendingDecision: null,
        termScratch: {
          ...scratch,
          skillRollsRemaining: scratch.skillRollsRemaining - 1,
        },
      },
    },
  };
}
