/**
 * Mustering-out tests. Drive characters through to "done" state and verify
 * invariants on the resulting cash, possessions, retirement, and cascade
 * resolution.
 */

import { describe, it, expect } from "vitest";
import { createRng } from "../engine/rng";
import { runSync } from "../strategies/runSync";
import { RandomStrategy } from "../strategies/random";

function genCharacter(seed: string) {
  return runSync(
    new RandomStrategy(createRng(`strat-${seed}`)),
    createRng(seed),
    seed,
  );
}

describe("Mustering out", () => {
  it("characters that survived at least one term have cash or possessions", () => {
    // With benefits and cash being the only outputs, any character with
    // qualifying terms should have at least one of the two.
    for (let i = 0; i < 50; i++) {
      const c = genCharacter(`muster-${i}`);
      if (c.generation.qualifyingTerms >= 1) {
        const hasCash = c.cash > 0;
        const hasPossession = c.possessions.length > 0;
        const hasPassage = c.passages.high + c.passages.middle + c.passages.low > 0;
        const hasStatBenefitInLog = c.log.some((l) => /Mustering-out benefit: \+/.test(l.text));
        // At least one of these should hold (rolls aren't no-ops by default).
        expect(hasCash || hasPossession || hasPassage || hasStatBenefitInLog).toBe(true);
      }
    }
  });

  it("never exceeds cash limit (3 by default, 2 if anagathics was used)", () => {
    for (let i = 0; i < 50; i++) {
      const c = genCharacter(`cash-limit-${i}`);
      const cashLines = c.log.filter((l) => l.text.startsWith("Cash table:"));
      const limit = c.anagathics.cashRollLimit;
      expect(cashLines.length).toBeLessThanOrEqual(limit);
    }
  });

  it("scout ship is received at most once", () => {
    for (let i = 0; i < 100; i++) {
      const c = genCharacter(`scout-ship-${i}`);
      const ships = c.possessions.filter((p) => p.objectId === "scoutShip").length;
      expect(ships).toBeLessThanOrEqual(1);
    }
  });

  it("ends in 'done' phase with no pending decision", () => {
    for (let i = 0; i < 50; i++) {
      const c = genCharacter(`done-${i}`);
      expect(c.generation.phase).toBe("done");
      expect(c.generation.pendingDecision).toBeNull();
    }
  });

  it("scouts never receive retirement pay (canRetire=false)", () => {
    // Force-Scout strategy so this stays a Scout-specific assertion.
    for (let i = 0; i < 100; i++) {
      const seed = `scout-no-retire-${i}`;
      const inner = new RandomStrategy(createRng(`strat-${seed}`));
      const strategy = {
        decide(req: import("../engine/types").DecisionRequest, c: import("../engine/types").Character) {
          if (req.kind === "chooseCareer" && req.options.includes("Scouts")) {
            return { kind: "chooseCareer" as const, careerId: "Scouts" };
          }
          const d = inner.decide(req, c);
          if (d instanceof Promise) throw new Error("sync only");
          return d;
        },
      };
      const character = runSync(strategy, createRng(seed), seed);
      if (character.career === "Scouts") {
        expect(character.retirementPay).toBe(0);
      }
    }
  });
});
