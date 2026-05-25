/**
 * Helpers for applying mustering-out benefits.
 */

import { roll1d } from "../dice";
import type { RNG } from "../rng";
import type { Character, BenefitOutcome, MusterOutScratch } from "../types";
import { appendLog } from "../log";
import { applyDelta } from "../upp";

/**
 * Apply a benefit outcome to a character. Weapons are flagged as "needs
 * weapon choice" and require a follow-up decision; this function does NOT
 * issue that decision — the caller (musterOut phase) does.
 *
 * Returns the updated character. For weapon outcomes, returns null to signal
 * that a chooseWeapon decision is needed.
 */
export function applyBenefit(
  character: Character,
  outcome: BenefitOutcome,
  scratch: MusterOutScratch,
): { character: Character; pendingWeapon: boolean } {
  switch (outcome.kind) {
    case "lowPassage":
      return {
        character: appendLog(
          { ...character, passages: { ...character.passages, low: character.passages.low + 1 } },
          "Received Low Passage.",
        ),
        pendingWeapon: false,
      };
    case "midPassage":
      return {
        character: appendLog(
          { ...character, passages: { ...character.passages, middle: character.passages.middle + 1 } },
          "Received Middle Passage.",
        ),
        pendingWeapon: false,
      };
    case "highPassage":
      return {
        character: appendLog(
          { ...character, passages: { ...character.passages, high: character.passages.high + 1 } },
          "Received High Passage.",
        ),
        pendingWeapon: false,
      };
    case "statBump": {
      const updated = {
        ...character,
        upp: applyDelta(character.upp, outcome.stat, outcome.amount),
      };
      return {
        character: appendLog(
          updated,
          `Mustering-out benefit: +${outcome.amount} ${outcome.stat}.`,
        ),
        pendingWeapon: false,
      };
    }
    case "tasMembership":
      if (scratch.tasReceived) {
        return {
          character: appendLog(character, "TAS membership offered again — already received; roll wasted."),
          pendingWeapon: false,
        };
      }
      return {
        character: appendLog(
          {
            ...character,
            possessions: [...character.possessions, { description: "Travellers' Aid Society membership" }],
          },
          "Received Travellers' Aid Society membership.",
        ),
        pendingWeapon: false,
      };
    case "object": {
      // Scout Ship is single-instance per book.
      if (outcome.objectId === "scoutShip" && scratch.scoutShipReceived) {
        return {
          character: appendLog(character, "Scout/Courier offered again — already received; roll wasted."),
          pendingWeapon: false,
        };
      }
      const description = describeObject(outcome.objectId);
      return {
        character: appendLog(
          {
            ...character,
            possessions: [
              ...character.possessions,
              { description, objectId: outcome.objectId },
            ],
          },
          `Received ${description}.`,
        ),
        pendingWeapon: false,
      };
    }
    case "weapon":
      // The phase asks the player to pick a weapon. Return unchanged here; the
      // caller will issue chooseWeapon.
      return { character, pendingWeapon: true };
    case "none":
      return {
        character: appendLog(character, "Mustering-out roll: no benefit."),
        pendingWeapon: false,
      };
  }
}

export function describeObject(id: string): string {
  switch (id) {
    case "scoutShip":
      return "Scout/Courier (loan; cannot be sold)";
    case "yacht":
      return "Yacht (40-year loan)";
    case "freeTrader":
      return "Free Trader (40-year loan)";
    case "labShip":
      return "Lab Ship (40-year loan)";
    case "safariShip":
      return "Safari Ship (40-year loan)";
    case "corsair":
      return "Corsair (owned)";
    case "seeker":
      return "Seeker (40-year loan)";
    case "instrument":
      return "Medical instruments (Cr5000)";
    case "forensicKit":
      return "Forensic Kit (Cr9000)";
    case "watch":
      return "Gold watch";
    case "letterOfMarque":
      return "Letter of Marque";
    default:
      return id;
  }
}

/**
 * Roll a benefit and return (table entry, raw roll, DM applied, effective roll).
 */
export function rollBenefitTable(rng: RNG, dm: number): { face: number; effective: number } {
  const face = roll1d(rng);
  // Clamp the effective index to 7 (max table row).
  const effective = Math.min(7, face + dm);
  return { face, effective };
}

export function rollCashTable(rng: RNG, dm: number): { face: number; effective: number } {
  const face = roll1d(rng);
  const effective = Math.min(7, face + dm);
  return { face, effective };
}
