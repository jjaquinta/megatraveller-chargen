/**
 * Anagathics phase.
 *
 * Per the rules: at the start of each term (before survival), if the
 * character is at least 30 years old and has reached term 4 (the book says
 * "upon reaching age 30 at the end of the third term"), they may declare
 * use of anagathics for the term.
 *
 * Declaring use:
 *   - Applies -1 (or -2 for nobles) DM to survival this term.
 *   - Forfeits this term's mustering-out roll budget by 1.
 *   - Permanently sets cashRollLimit to 2 (if not already).
 *   - On the first term: still advance apparent age normally.
 *   - On subsequent terms with a supply: apparent age stays put.
 *
 * Finding supply: roll 12+ on 2D with starport/tech DMs. If fail, retry
 * after rerolling survival (rules state "must succeed second time or muster
 * out"). For v1 we implement only the simple "specify and try to find a
 * supply" path; the retry is left for a future slice.
 *
 * This phase reads a single anagathicsUse decision and immediately exits to
 * term phase. (Term phase consumes anagathicsChosen when computing the
 * survival DM.)
 */

import { roll2d } from "../dice";
import type { RNG } from "../rng";
import type { Character, Decision, DecisionRequest, PhaseResult } from "../types";
import { appendLog } from "../log";

/**
 * Returns true if the character is eligible for the anagathics decision
 * this term (i.e., should be offered the choice).
 */
export function isAnagathicsEligible(character: Character): boolean {
  // Rules: "upon reaching age 30 at the end of the third term of service".
  // We test against age >= 30 (which includes apparent age, since once you
  // start anagathics the apparent age may stop advancing but actual age
  // continues — and the rule applies based on actual age).
  return character.age >= 30 && character.generation.termNumber >= 4;
}

/**
 * Called from inside the term phase as a sub-phase when eligible and not yet
 * decided. Returns either a decision request or a "continue" with the
 * decision applied.
 */
export function offerAnagathics(
  character: Character,
  decision: Decision | undefined,
  rng: RNG,
): PhaseResult {
  const scratch = character.generation.termScratch!;
  if (!character.generation.pendingDecision || character.generation.pendingDecision.kind !== "anagathicsUse") {
    const request: DecisionRequest = {
      kind: "anagathicsUse",
      currentlyUsing: character.anagathics.using,
      hasSupply: character.anagathics.hasSupply,
      apparentAge: character.generation.apparentAge,
      actualAge: character.age,
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

  if (!decision || decision.kind !== "anagathicsUse") {
    throw new Error("Expected anagathicsUse decision");
  }

  if (!decision.use) {
    // Player declines for this term. If previously using, this triggers
    // withdrawal at end of term (handled in aging phase; v1 simplification:
    // we just stop using; withdrawal effects are deferred).
    const updated = appendLog(
      character,
      decision.kind === "anagathicsUse" && character.anagathics.using
        ? "Declined to take anagathics this term (will stop using)."
        : "Declined anagathics.",
    );
    return {
      kind: "continue",
      character: {
        ...updated,
        anagathics: {
          ...updated.anagathics,
          using: false,
          // Supply may still be available, but we mark it dropped this term.
          hasSupply: false,
        },
        generation: {
          ...updated.generation,
          pendingDecision: null,
          termScratch: { ...scratch, anagathicsChosen: false, anagathicsDecided: true },
        },
      },
    };
  }

  // Player chooses to take anagathics. Try to find a supply.
  const homeworld = character.homeworld;
  let supplyDM = 0;
  if (homeworld) {
    if (homeworld.starport === "A") supplyDM += 3;
    else if (homeworld.starport === "B") supplyDM += 2;
    else if (homeworld.starport === "C") supplyDM += 1;
    if (homeworld.techLevel >= 9 && homeworld.techLevel <= 11) supplyDM += 1; // Early Stellar
    else if (homeworld.techLevel >= 12 && homeworld.techLevel <= 13) supplyDM += 2; // Average Stellar
    else if (homeworld.techLevel >= 14) supplyDM += 3; // High Stellar
  }
  const supplyRoll = roll2d(rng, supplyDM);
  const found = supplyRoll.effective >= 12;

  // Either way the character has "chosen" to take anagathics for this term:
  // the survival DM and mustering-out forfeit apply regardless of whether a
  // supply is found. The aging benefit only applies if a supply is found.
  let updated = appendLog(
    character,
    found
      ? `Took anagathics; found supply (rolled ${supplyRoll.total}${supplyDM ? `+${supplyDM}` : ""} vs 12+).`
      : `Took anagathics but supply unavailable (rolled ${supplyRoll.total}${supplyDM ? `+${supplyDM}` : ""} vs 12+).`,
  );

  updated = {
    ...updated,
    anagathics: {
      using: true,
      hasSupply: found,
      apparentAge: updated.generation.apparentAge,
      cashRollLimit: 2, // permanent
    },
  };

  return {
    kind: "continue",
    character: {
      ...updated,
      generation: {
        ...updated.generation,
        pendingDecision: null,
        termScratch: { ...scratch, anagathicsChosen: true, anagathicsDecided: true },
      },
    },
  };
}
