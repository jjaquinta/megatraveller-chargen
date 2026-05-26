/**
 * Career selection + enlistment + draft.
 *
 * chooseCareer: pause for a career choice. The decision yields a careerId.
 * enlistment: roll 2D+DMs vs the career's enlistment threshold. On success,
 *   transition to "term". On failure, roll 1D for the draft: the character
 *   is offered an assignment to one of the six military careers (those with
 *   draftSlot 1-6). The player may accept (transition to term) or decline
 *   (loop back to chooseCareer).
 */

import { roll2d } from "../dice";
import type { RNG } from "../rng";
import type { CareerId, Character, Decision, DecisionRequest, PhaseResult } from "../types";
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
      // Homeworld restrictions
      if (!career.enlistmentRestrictions.every((r) => character.homeworld && r.matches(character.homeworld))) {
        continue;
      }
      // Special: Noble requires Soc 10+ (book p. 31, "Noble" special rules).
      if (career.id === "Noble" && character.upp.Soc < 10) continue;
      options.push(career.id);
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
  decision: Decision | undefined,
  rng: RNG,
): PhaseResult {
  // Handle an incoming acceptDraft decision first.
  if (character.generation.pendingDecision?.kind === "acceptDraft" && decision) {
    if (decision.kind !== "acceptDraft") throw new Error("Expected acceptDraft decision");
    const assigned = (character.generation.pendingDecision as { assigned: CareerId }).assigned;
    if (decision.accept) {
      const career = getCareer(assigned);
      const updated = appendLog(character, `Accepted draft into the ${career.name}.`);
      return {
        kind: "continue",
        character: {
          ...updated,
          career: assigned,
          generation: {
            ...updated.generation,
            phase: "term",
            pendingDecision: null,
            termNumber: 1,
            termScratch: freshTermScratch(career, /*isInitialTerm*/ true),
          },
        },
      };
    } else {
      // Decline draft: back to chooseCareer.
      const updated = appendLog(character, `Declined draft. Returning to career selection.`);
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
  }

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

  // Enlistment failed. Roll for the draft (1D into the 6 military careers).
  const draftRoll = Math.floor(rng.next() * 6) + 1;
  let draftedTo: CareerId | null = null;
  for (const c of CAREER_REGISTRY.values()) {
    if (c.draftSlot === draftRoll) {
      draftedTo = c.id;
      break;
    }
  }

  if (!draftedTo) {
    // Should never happen once all 6 military careers are registered, but
    // be defensive: fall back to a re-roll loop.
    const logged = appendLog(
      character,
      `Failed to enlist in the ${career.name} (rolled ${roll.total}${dms ? `+${dms}` : ""} vs ${career.thresholds.enlistment.target}+). Try again.`,
    );
    return {
      kind: "continue",
      character: {
        ...logged,
        career: null,
        generation: { ...logged.generation, phase: "chooseCareer", pendingDecision: null },
      },
    };
  }

  const logged = appendLog(
    character,
    `Failed to enlist in the ${career.name} (rolled ${roll.total}${dms ? `+${dms}` : ""} vs ${career.thresholds.enlistment.target}+). Drafted into the ${draftedTo} (1D=${draftRoll}).`,
  );
  const request: DecisionRequest = { kind: "acceptDraft", assigned: draftedTo };
  return {
    kind: "needDecision",
    decision: request,
    character: {
      ...logged,
      career: null,
      generation: { ...logged.generation, pendingDecision: request },
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
    anagathicsChosen: false,
    anagathicsDecided: false,
    agingResolved: false,
  };
}
