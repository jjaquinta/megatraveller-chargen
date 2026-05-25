/**
 * Central dispatcher.
 *
 * advance() drives the engine forward until it either pauses on a decision
 * or finishes. Phase handlers return PhaseResult; advance() loops on
 * "continue" so multiple no-decision phases collapse into one call.
 *
 * Loop guard: a hard cap on iterations prevents pathological loops if a
 * phase handler forgets to make progress.
 */

import type { RNG } from "./rng";
import type {
  Character,
  Decision,
  GenerationResult,
  GenerationState,
  PhaseResult,
} from "./types";
import { handleIdentity } from "./phases/identity";
import { handleChooseCareer, handleEnlistment } from "./phases/enlistment";
import { handleTerm } from "./phases/term";
import { handleReenlist } from "./phases/reenlist";
import { handleMusterOut } from "./phases/musterOut";
import { handleCascadeResolution } from "./phases/cascadeResolution";

const MAX_ITERATIONS = 1000;

export function advance(
  character: Character,
  decision: Decision | undefined,
  rng: RNG,
): GenerationResult {
  let current = character;
  let pendingDecision = decision;
  let iterations = 0;

  while (true) {
    if (++iterations > MAX_ITERATIONS) {
      throw new Error(`advance() exceeded ${MAX_ITERATIONS} iterations; check for an infinite loop in a phase handler`);
    }

    const result: PhaseResult = dispatch(current, pendingDecision, rng);

    if (result.kind === "needDecision") {
      return { kind: "needDecision", decision: result.decision, character: result.character };
    }
    if (result.kind === "done") {
      return { kind: "done", character: result.character };
    }
    // continue: re-dispatch. The decision was consumed by the handler that
    // just ran; subsequent handlers in this same advance() call don't see it.
    current = result.character;
    pendingDecision = undefined;
  }
}

function dispatch(character: Character, decision: Decision | undefined, rng: RNG): PhaseResult {
  switch (character.generation.phase) {
    case "identity":
      return handleIdentity(character, decision, rng);
    case "chooseCareer":
      return handleChooseCareer(character, decision);
    case "enlistment":
      return handleEnlistment(character, decision, rng);
    case "term":
      return handleTerm(character, decision, rng);
    case "reenlist":
      return handleReenlist(character, decision, rng);
    case "musterOut":
      return handleMusterOut(character, decision, rng);
    case "cascadeResolution":
      return handleCascadeResolution(character, decision);
    case "done":
      return { kind: "done", character };
    default:
      throw new Error(`Unknown phase: ${character.generation.phase satisfies never}`);
  }
}

// ============================================================================
// Character construction
// ============================================================================

export function newCharacter(seed: string): Character {
  const generation: GenerationState = {
    phase: "identity",
    termNumber: 0,
    pendingDecision: null,
    termScratch: null,
    musterOutScratch: null,
    pendingCascades: [],
    apparentAge: 18,
    qualifyingTerms: 0,
  };

  return {
    id: cryptoRandomId(),
    name: "",
    gender: "",
    race: "Human",
    upp: { Str: 7, Dex: 7, End: 7, Int: 7, Edu: 7, Soc: 7 }, // placeholder until UPP is rolled
    homeworld: null,
    age: 18,
    career: null,
    terms: 0,
    rank: 0,
    skills: new Map(),
    possessions: [],
    cash: 0,
    passages: { high: 0, middle: 0, low: 0 },
    decorations: [],
    brownie: 0,
    anagathics: {
      using: false,
      hasSupply: false,
      apparentAge: null,
      cashRollLimit: 3,
    },
    retirementPay: 0,
    log: [],
    generation,
    edits: [],
    seed,
    schemaVersion: 1,
  };
}

function cryptoRandomId(): string {
  // Same approach as our RNG seed: 64 bits of hex.
  const buf = new Uint32Array(2);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(buf);
  } else {
    buf[0] = (Date.now() & 0xffffffff) >>> 0;
    buf[1] = (Math.floor(Math.random() * 0xffffffff) & 0xffffffff) >>> 0;
  }
  return (buf[0] ?? 0).toString(16).padStart(8, "0") + (buf[1] ?? 0).toString(16).padStart(8, "0");
}
