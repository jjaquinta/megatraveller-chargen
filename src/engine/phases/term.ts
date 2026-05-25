/**
 * Term phase: anagathics-choice → survival → commission → promotion →
 * special duty → skills → aging → end-of-term.
 *
 * Each call advances by the smallest possible step. Per-term scratch state
 * lives in character.generation.termScratch.
 *
 * Order matters: anagathics declaration happens before survival because it
 * modifies the survival DM. Aging happens after all term events (including
 * skills) so failed aging saving throws can use Medical earned that term.
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
import { isAnagathicsEligible, offerAnagathics } from "./anagathics";
import { handleAging } from "./aging";

export function handleTerm(
  character: Character,
  decision: Decision | undefined,
  rng: RNG,
): PhaseResult {
  if (!character.career) throw new Error("term with no career");
  const career = getCareer(character.career);
  const scratch = character.generation.termScratch;
  if (!scratch) throw new Error("term phase with no scratch state");

  // Step 0: anagathics decision (term 4+, age 30+, not yet decided).
  if (!scratch.anagathicsDecided && isAnagathicsEligible(character)) {
    return offerAnagathics(character, decision, rng);
  }

  // Step 1: survival.
  if (!scratch.survived) {
    return rollSurvival(character, career, rng);
  }

  // Step 2: commission.
  if (career.thresholds.commission !== null && !scratch.commissionAttempted && character.rank === 0) {
    return rollCommission(character, career, rng);
  }

  // Step 3: promotion.
  if (career.thresholds.promotion !== null && character.rank > 0 && !scratch.promoted) {
    return rollPromotion(character, career, rng);
  }

  // Step 4: special duty.
  if (!scratch.specialDuty && !character.generation.pendingDecision) {
    return rollSpecialDuty(character, career, rng);
  }

  // Step 5: skills (may pause for chooseSkillTable).
  if (scratch.skillRollsRemaining > 0) {
    return handleSkillRoll(character, career, decision, rng);
  }

  // Step 6: aging. Apparent age advances by 4 at end of term *unless* on
  // anagathics with a supply (after the first term of using). v1 implements
  // the simple rule: anagathics with supply freezes apparent age; without
  // supply (or first term on anagathics), apparent age advances normally.
  if (!scratch.agingResolved) {
    // Advance ages first.
    const actualNewAge = character.age + 4;
    let apparentNewAge = character.generation.apparentAge + 4;
    if (character.anagathics.using && character.anagathics.hasSupply && character.anagathics.apparentAge !== null
        && character.anagathics.apparentAge !== character.generation.apparentAge) {
      // We've already used anagathics for at least one term, and supply is
      // maintained: hold apparent age. (apparentAge was set during the first
      // anagathics term to the then-current apparent age.)
      apparentNewAge = character.anagathics.apparentAge;
    }
    // First-anagathics-term tracking: if using and hasSupply but apparentAge
    // hasn't been set yet, lock it now (to the *new* apparent age — first
    // term still advances per the book).
    let nextAnagatStateApparent = character.anagathics.apparentAge;
    if (character.anagathics.using && character.anagathics.hasSupply && nextAnagatStateApparent === null) {
      nextAnagatStateApparent = apparentNewAge;
    }

    let aged: Character = {
      ...character,
      age: actualNewAge,
      generation: {
        ...character.generation,
        apparentAge: apparentNewAge,
      },
      anagathics: { ...character.anagathics, apparentAge: nextAnagatStateApparent },
    };
    aged = appendLog(
      aged,
      character.anagathics.using
        ? `End of term ${character.generation.termNumber}; age ${actualNewAge} (apparent ${apparentNewAge}).`
        : `End of term ${character.generation.termNumber}; age ${actualNewAge}.`,
    );

    // Run aging if apparent age has crossed 34. The aging phase itself
    // handles its no-op case if apparent age < 34.
    return handleAging(aged, undefined, rng);
  }

  // Step 7: end of term — increment terms, transition to reenlist.
  // qualifyingTerms (for muster-out budget) doesn't count anagathics terms.
  const qualifyingTerms =
    character.generation.qualifyingTerms + (scratch.anagathicsChosen ? 0 : 1);

  return {
    kind: "continue",
    character: {
      ...character,
      terms: character.generation.termNumber,
      generation: {
        ...character.generation,
        phase: "reenlist",
        pendingDecision: null,
        termScratch: null,
        qualifyingTerms,
      },
    },
  };
}

function rollSurvival(character: Character, career: CareerDef, rng: RNG): PhaseResult {
  let dms = evaluateDMs(career.thresholds.survival.dms, character);
  // Anagathics survival DM: -1 (or -2 for nobles)
  if (character.generation.termScratch?.anagathicsChosen) {
    dms += career.anagathicsSurvivalDm;
  }
  // Belter survival DM rule
  if (career.thresholds.survival.specialDmRule === "belterTerms") {
    dms += character.generation.termNumber;
  }

  const roll = roll2d(rng, dms);
  const survived = roll.effective >= career.thresholds.survival.target;
  const newScratch: TermScratch = { ...character.generation.termScratch!, survived };
  const dmStr = formatDM(dms);

  if (survived) {
    const updated = appendLog(
      character,
      `Survived term ${character.generation.termNumber} (rolled ${roll.total}${dmStr} vs ${career.thresholds.survival.target}+).`,
    );
    return {
      kind: "continue",
      character: {
        ...updated,
        generation: { ...updated.generation, termScratch: newScratch },
      },
    };
  }

  // Failed survival: mustered out after two years. Half-term doesn't count.
  const updated = appendLog(
    { ...character, age: character.age + 2, generation: { ...character.generation, apparentAge: character.generation.apparentAge + 2 } },
    `Failed survival in term ${character.generation.termNumber} (rolled ${roll.total}${dmStr} vs ${career.thresholds.survival.target}+). Mustered out early.`,
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
  const oldScratch = character.generation.termScratch!;
  const newScratch: TermScratch = {
    ...oldScratch,
    commissionAttempted: true,
    commissioned: success,
    skillRollsRemaining: oldScratch.skillRollsRemaining + (success ? 1 : 0),
  };
  const dmStr = formatDM(dms);
  const updated = appendLog(
    success ? { ...character, rank: 1 } : character,
    success
      ? `Commissioned (rolled ${roll.total}${dmStr} vs ${t.target}+).`
      : `Failed commission (rolled ${roll.total}${dmStr} vs ${t.target}+).`,
  );
  return {
    kind: "continue",
    character: { ...updated, generation: { ...updated.generation, termScratch: newScratch } },
  };
}

function rollPromotion(character: Character, career: CareerDef, rng: RNG): PhaseResult {
  const t = career.thresholds.promotion!;
  const dms = evaluateDMs(t.dms, character);
  const roll = roll2d(rng, dms);
  const success = roll.effective >= t.target;
  const newRank = success ? Math.min(character.rank + 1, career.ranks.length) : character.rank;
  const oldScratch = character.generation.termScratch!;
  const newScratch: TermScratch = {
    ...oldScratch,
    promoted: true,
    skillRollsRemaining: oldScratch.skillRollsRemaining + (success ? 1 : 0),
  };
  const dmStr = formatDM(dms);
  const updated = appendLog(
    success ? { ...character, rank: newRank } : character,
    success
      ? `Promoted to rank ${newRank} (rolled ${roll.total}${dmStr} vs ${t.target}+).`
      : `Did not promote (rolled ${roll.total}${dmStr} vs ${t.target}+).`,
  );
  return {
    kind: "continue",
    character: { ...updated, generation: { ...updated.generation, termScratch: newScratch } },
  };
}

function rollSpecialDuty(character: Character, career: CareerDef, rng: RNG): PhaseResult {
  const t = career.thresholds.specialDuty;
  const dms = evaluateDMs(t.dms, character);
  const roll = roll2d(rng, dms);
  const success = roll.effective >= t.target;
  const oldScratch = character.generation.termScratch!;
  const newScratch: TermScratch = {
    ...oldScratch,
    specialDuty: true,
    skillRollsRemaining: oldScratch.skillRollsRemaining + (success ? 1 : 0),
  };
  const dmStr = formatDM(dms);
  const updated = appendLog(
    character,
    success
      ? `Special duty earned (+1 skill) (rolled ${roll.total}${dmStr} vs ${t.target}+).`
      : `No special duty (rolled ${roll.total}${dmStr} vs ${t.target}+).`,
  );
  return {
    kind: "continue",
    character: { ...updated, generation: { ...updated.generation, termScratch: newScratch } },
  };
}

function handleSkillRoll(
  character: Character,
  career: CareerDef,
  decision: Decision | undefined,
  rng: RNG,
): PhaseResult {
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

  let updated = character;
  if (entry.statBump) {
    updated = { ...updated, upp: applyDelta(updated.upp, entry.statBump, 1) };
    updated = appendLog(
      updated,
      `Studied on the ${table.name} table (rolled ${die}): +1 ${entry.statBump}.`,
    );
  } else {
    const skill = getSkill(entry.skillId);
    const current = updated.skills.get(skill.id) ?? 0;
    const newSkills = new Map(updated.skills);
    newSkills.set(skill.id, current + 1);
    updated = { ...updated, skills: newSkills };
    if (skill.isCascade) {
      const pending = updated.generation.pendingCascades.includes(skill.id)
        ? updated.generation.pendingCascades
        : [...updated.generation.pendingCascades, skill.id];
      updated = {
        ...updated,
        generation: { ...updated.generation, pendingCascades: pending },
      };
      updated = appendLog(
        updated,
        `Studied on the ${table.name} table (rolled ${die}): banked ${skill.name} (to resolve later).`,
      );
    } else {
      updated = appendLog(
        updated,
        `Studied on the ${table.name} table (rolled ${die}): ${skill.name}-${current + 1}.`,
      );
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
        termScratch: { ...scratch, skillRollsRemaining: scratch.skillRollsRemaining - 1 },
      },
    },
  };
}

function formatDM(dms: number): string {
  if (dms === 0) return "";
  return dms > 0 ? `+${dms}` : `${dms}`;
}
