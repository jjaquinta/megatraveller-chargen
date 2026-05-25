/**
 * Identity phase: name, gender, race, homeworld.
 *
 * If the character is entering this phase fresh (no pending decision), it
 * asks for identity. When the decision is supplied, it applies it, rolls
 * the UPP, logs, and transitions to chooseCareer (returning "continue" so
 * advance() can immediately dispatch the next phase).
 */

import { roll2d } from "../dice";
import type { RNG } from "../rng";
import type { Character, Decision, DecisionRequest, PhaseResult } from "../types";
import { appendLog } from "../log";
import { encodeUPP } from "../upp";

export function handleIdentity(
  character: Character,
  decision: Decision | undefined,
  rng: RNG,
): PhaseResult {
  // Fresh entry into this phase — ask for identity.
  if (character.generation.pendingDecision === null) {
    const request: DecisionRequest = { kind: "chooseIdentity" };
    return {
      kind: "needDecision",
      decision: request,
      character: {
        ...character,
        generation: { ...character.generation, pendingDecision: request },
      },
    };
  }

  if (!decision || decision.kind !== "chooseIdentity") {
    throw new Error("Expected chooseIdentity decision");
  }

  // Apply identity, roll UPP.
  const upp = {
    Str: roll2d(rng).total,
    Dex: roll2d(rng).total,
    End: roll2d(rng).total,
    Int: roll2d(rng).total,
    Edu: roll2d(rng).total,
    Soc: roll2d(rng).total,
  };

  const updated: Character = {
    ...character,
    name: decision.name,
    gender: decision.gender,
    race: decision.race,
    homeworld: decision.homeworld,
    upp,
    generation: {
      ...character.generation,
      phase: "chooseCareer",
      pendingDecision: null,
    },
  };

  const logged = appendLog(
    appendLog(updated, `Born on a class ${decision.homeworld.starport}, tech-${decision.homeworld.techLevel} world.`),
    `Initial UPP: ${encodeUPP(upp)}.`,
  );

  return { kind: "continue", character: logged };
}
