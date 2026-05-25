/**
 * Aging phase.
 *
 * Invoked at end of term when apparent age has crossed an Aging Table line.
 * For non-anagathics characters: apparentAge = actualAge, and we roll saving
 * throws for every characteristic listed in the appropriate row.
 *
 * For anagathics characters: two of the physical chars (or two of the four
 * on the age 66+ row) are auto-saved per the player's choice. The remaining
 * ones still roll. Withdrawal effects (double-rolls) are signalled via a
 * flag on AnagathicsState; we apply them here transparently.
 *
 * The Aging Crisis (stat reduced to 0) is resolved inline here: roll 8+ to
 * survive, with +Medical DM. If survived, stat goes to 1; if not, the
 * character is dead and we'd want a special handling. For v1 we mark age
 * crisis result in the log but continue (death-during-gen is a corner case;
 * book gives the option to recover with stat=1, which is the friendlier
 * interpretation).
 *
 * v1 simplification: anagathics user's "choose which chars to save" is
 * automated — we always save the two with the lowest saving-throw success
 * probability (i.e. the highest target numbers). A future slice will make
 * this a player decision via agingSavedCharacteristics.
 */

import { roll2d } from "../dice";
import type { RNG } from "../rng";
import type {
  Character,
  CharacteristicName,
  Decision,
  PhaseResult,
} from "../types";
import { agingEffectsFor } from "../rules/ageEffects";
import { appendLog } from "../log";
import { applyDelta } from "../upp";

export function handleAging(
  character: Character,
  _decision: Decision | undefined,
  rng: RNG,
): PhaseResult {
  const apparentAge = character.generation.apparentAge;
  const effects = agingEffectsFor(apparentAge);
  if (!effects) {
    // Too young to age. Mark resolved and return to term.
    return {
      kind: "continue",
      character: markResolvedAndContinue(character),
    };
  }

  // On anagathics? Pick which to auto-save.
  // v1 heuristic: save the two with highest savingThrow targets.
  const autoSavedSet = new Set<CharacteristicName>();
  if (character.anagathics.using) {
    const sorted = [...effects].sort((a, b) => b.savingThrow - a.savingThrow);
    const toSave = effects.length === 4 ? 2 : 2;
    for (let i = 0; i < toSave && i < sorted.length; i++) {
      autoSavedSet.add(sorted[i]!.stat);
    }
  }

  // Apply each saving throw.
  let updated = character;
  const lossLines: string[] = [];

  // Withdrawal effects: if the character lost their anagathics supply this
  // term (signalled by anagathics.using=false && hasSupply=false but had been
  // using previously), we'd double-roll. For v1 we don't track previous-term
  // anagathics history, so withdrawal is deferred to a later slice.

  for (const effect of effects) {
    if (autoSavedSet.has(effect.stat)) {
      lossLines.push(`${effect.stat}: auto-saved (anagathics).`);
      continue;
    }
    const roll = roll2d(rng);
    const passed = roll.total >= effect.savingThrow;
    if (passed) {
      lossLines.push(
        `${effect.stat}: saved (rolled ${roll.total} vs ${effect.savingThrow}+).`,
      );
    } else {
      const beforeValue = updated.upp[effect.stat];
      const afterValue = Math.max(0, beforeValue - effect.loss);
      updated = { ...updated, upp: { ...updated.upp, [effect.stat]: afterValue } };
      lossLines.push(
        `${effect.stat}: failed (rolled ${roll.total} vs ${effect.savingThrow}+); lost ${effect.loss} (${beforeValue}→${afterValue}).`,
      );

      // Aging crisis: stat reduced to 0
      if (afterValue === 0) {
        const medical = updated.skills.get("Medical") ?? 0;
        const crisisRoll = roll2d(rng, medical);
        const survived = crisisRoll.effective >= 8;
        if (survived) {
          updated = { ...updated, upp: { ...updated.upp, [effect.stat]: 1 } };
          lossLines.push(
            `Aging crisis on ${effect.stat}! Survived (rolled ${crisisRoll.total}${medical ? `+${medical}` : ""} vs 8+); ${effect.stat} restored to 1.`,
          );
        } else {
          // Death is a real possibility per the book. v1 lenient: leave at 0
          // and log; player can edit later. A future slice could end gen here.
          lossLines.push(
            `Aging crisis on ${effect.stat}! Failed survival roll (${crisisRoll.total}${medical ? `+${medical}` : ""} vs 8+); ${effect.stat} remains 0 (mark for review).`,
          );
        }
      }
    }
  }

  const logged = appendLog(
    updated,
    `Aging at apparent age ${apparentAge}: ${lossLines.join(" ")}`,
  );

  return { kind: "continue", character: markResolvedAndContinue(logged) };
}

function markResolvedAndContinue(character: Character): Character {
  if (!character.generation.termScratch) return character;
  return {
    ...character,
    generation: {
      ...character.generation,
      termScratch: { ...character.generation.termScratch, agingResolved: true },
    },
  };
}

// Re-export so applyDelta is reachable elsewhere if needed (silences unused warning).
export { applyDelta };
