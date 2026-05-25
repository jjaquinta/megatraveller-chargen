/**
 * Reenlistment phase.
 *
 * Roll 2D vs the career's reenlistment threshold. The player normally chooses
 * whether to reenlist (subject to the roll succeeding). A natural 12 forces
 * mandatory reenlistment regardless of the player's wishes.
 *
 * Decision flow:
 *   1. Roll. If 12, mandatory reenlist — issue a "reenlist" decision with
 *      mayChoose: false so the UI just acknowledges; or in auto mode the
 *      strategy gets told it has no choice.
 *   2. If success and not mandatory, ask the player whether to reenlist
 *      (mayChoose: true).
 *   3. If failure, must muster out (no decision needed).
 */

import { roll2d } from "../dice";
import type { RNG } from "../rng";
import type {
  Character,
  Decision,
  DecisionRequest,
  PhaseResult,
} from "../types";
import { appendLog } from "../log";
import { evaluateDMs } from "../rules/dmRules";
import { getCareer } from "../../data";
import { freshTermScratch } from "./enlistment";

export function handleReenlist(
  character: Character,
  decision: Decision | undefined,
  rng: RNG,
): PhaseResult {
  if (!character.career) throw new Error("reenlist with no career");
  const career = getCareer(character.career);

  // If we have a pending decision, the player is supplying their choice.
  if (character.generation.pendingDecision?.kind === "reenlist" && decision) {
    if (decision.kind !== "reenlist") throw new Error("Expected reenlist decision");

    // Player chose: reenlist or muster out.
    if (decision.reenlist) {
      const next = character.generation.termNumber + 1;
      const updated = appendLog(character, `Reenlisted for term ${next}.`);
      return {
        kind: "continue",
        character: {
          ...updated,
          generation: {
            ...updated.generation,
            phase: "term",
            pendingDecision: null,
            termNumber: next,
            termScratch: freshTermScratch(career, /*isInitialTerm*/ false),
          },
        },
      };
    } else {
      const updated = appendLog(character, `Chose to muster out.`);
      return {
        kind: "continue",
        character: {
          ...updated,
          generation: {
            ...updated.generation,
            phase: "musterOut",
            pendingDecision: null,
          },
        },
      };
    }
  }

  // No pending decision yet: roll for reenlistment.
  const t = career.thresholds.reenlist;
  const dms = evaluateDMs(t.dms, character);
  const roll = roll2d(rng, dms);

  // Natural 12 (face total, before DMs): mandatory reenlist.
  if (roll.total === 12) {
    const next = character.generation.termNumber + 1;
    const updated = appendLog(
      character,
      `Mandatory reenlistment (rolled 12) — continuing into term ${next}.`,
    );
    return {
      kind: "continue",
      character: {
        ...updated,
        generation: {
          ...updated.generation,
          phase: "term",
          pendingDecision: null,
          termNumber: next,
          termScratch: freshTermScratch(career, /*isInitialTerm*/ false),
        },
      },
    };
  }

  const success = roll.effective >= t.target;
  if (!success) {
    const updated = appendLog(
      character,
      `Reenlistment denied (rolled ${roll.total}${dms ? `+${dms}` : ""} vs ${t.target}+). Mustering out.`,
    );
    return {
      kind: "continue",
      character: {
        ...updated,
        generation: {
          ...updated.generation,
          phase: "musterOut",
          pendingDecision: null,
        },
      },
    };
  }

  // Success and not mandatory: ask the player.
  const request: DecisionRequest = {
    kind: "reenlist",
    mandatoryIfRolled12: true,
    mayChoose: true,
  };
  const logged = appendLog(
    character,
    `Reenlistment available (rolled ${roll.total}${dms ? `+${dms}` : ""} vs ${t.target}+).`,
  );
  return {
    kind: "needDecision",
    decision: request,
    character: {
      ...logged,
      generation: { ...logged.generation, pendingDecision: request },
    },
  };
}
