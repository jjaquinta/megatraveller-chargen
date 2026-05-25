/**
 * Run an end-to-end character generation against a synchronous strategy.
 *
 * Async strategies (e.g. interactive UI) drive advance() themselves; this
 * helper is for tests and batch generation.
 */

import { advance, newCharacter } from "../engine/advance";
import type { Strategy } from "./types";
import type { Character } from "../engine/types";
import type { RNG } from "../engine/rng";

export function runSync(strategy: Strategy, rng: RNG, seed: string): Character {
  let character = newCharacter(seed);
  let result = advance(character, undefined, rng);
  let safety = 0;
  while (result.kind === "needDecision") {
    if (++safety > 10000) {
      throw new Error("runSync exceeded 10000 decisions; probable infinite loop");
    }
    const decision = strategy.decide(result.decision, result.character);
    if (decision instanceof Promise) {
      throw new Error("runSync requires a synchronous strategy");
    }
    character = result.character;
    result = advance(character, decision, rng);
  }
  return result.character;
}
