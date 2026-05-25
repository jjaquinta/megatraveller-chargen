/**
 * Career selection + enlistment.
 *
 * chooseCareer: pause for a career choice. The decision yields a careerId.
 * enlistment: roll 2D+DMs vs the career's enlistment threshold. On success,
 *   transition to "term" and start term 1. On failure, draft (a simplified
 *   v1 just assigns the failing character to the chosen career anyway as
 *   a draftee — full draft table comes later, but Scouts have a draft slot
 *   of 4, so we'll keep the door open).
 */

import { roll2d } from "../dice";
import type { RNG } from "../rng";
import type { Character, Decision, DecisionRequest, PhaseResult } from "../types";
import { appendLog } from "../log";
import { evaluateDMs } from "../rules/dmRules";
import { CAREER_REGISTRY, getCareer } from "../../data";

export function handleChooseCareer(
  character: Character,
  decision: Decision | undefined,
): PhaseResult {
  // Fresh entry — list options the character is eligible for, ask for a choice.
  if (character.generation.pendingDecision === null) {
    const options: string[] = [];
    for (const career of CAREER_REGISTRY.values()) {
      if (career.enlistmentRestrictions.every((r) => character.homeworld && r.matches(character.homeworld))) {
        options.push(career.id);
      }
    }
    const request: DecisionRequest = {
      kind: "chooseCareer",
      reason: character.career === null ? "initial" : "afterMusterOut",
      options,
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

  if (!decision || decision.kind !== "chooseCareer") {
    throw new Error("Expected chooseCareer decision");
  }

  const career = getCareer(decision.careerId);
  return {
    kind: "continue",
    character: {
      ...character,
      career: career.id,
      generation: {
        ...character.generation,
        phase: "enlistment",
        pendingDecision: null,
      },
    },
  };
}

export function handleEnlistment(
  character: Character,
  _decision: Decision | undefined,
  rng: RNG,
): PhaseResult {
  if (!character.career) throw new Error("enlistment with no career");
  const career = getCareer(character.career);

  const dms = evaluateDMs(career.thresholds.enlistment.dms, character);
  const roll = roll2d(rng, dms);
  const success = roll.effective >= career.thresholds.enlistment.target;

  if (success) {
    const updated = appendLog(
      character,
      `Enlisted in the ${career.name} (rolled ${roll.total}${dms ? `+${dms}` : ""} vs ${career.thresholds.enlistment.target}+).`,
    );
    return {
      kind: "continue",
      character: {
        ...updated,
        generation: {
          ...updated.generation,
          phase: "term",
          pendingDecision: null,
          termNumber: 1,
          termScratch: freshTermScratch(career, /*isInitialTerm*/ true),
        },
      },
    };
  }

  // Enlistment failed. v1 simplification: refuse and ask again. (Full draft
  // logic with the 1D draft table arrives when we add the military careers.)
  const updated = appendLog(
    character,
    `Failed to enlist in the ${career.name} (rolled ${roll.total}${dms ? `+${dms}` : ""} vs ${career.thresholds.enlistment.target}+). Try again.`,
  );
  return {
    kind: "continue",
    character: {
      ...updated,
      career: null,
      generation: {
        ...updated.generation,
        phase: "chooseCareer",
        pendingDecision: null,
      },
    },
  };
}

export function freshTermScratch(
  career: import("../types").CareerDef,
  isInitialTerm: boolean,
): import("../types").TermScratch {
  const skillRolls = isInitialTerm
    ? career.skillsPerInitialTerm
    : career.skillsPerSubsequentTerm;
  return {
    survived: false,
    commissionAttempted: false,
    commissioned: false,
    promoted: false,
    specialDuty: false,
    skillRollsRemaining: skillRolls,
  };
}
