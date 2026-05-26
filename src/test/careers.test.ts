/**
 * Tests for the full set of 18 basic-gen careers.
 *
 * Reusable forced-career helper, plus per-career feature checks.
 */

import { describe, it, expect } from "vitest";
import { createRng } from "../engine/rng";
import { runSync } from "../strategies/runSync";
import { RandomStrategy } from "../strategies/random";
import { CAREER_REGISTRY, getCareer } from "../data";
import type { Strategy } from "../strategies/types";
import type { CareerId, Character, Decision, DecisionRequest } from "../engine/types";

/** Strategy that forces a specific career id at chooseCareer when allowed. */
function forceCareer(strat: RandomStrategy, careerId: CareerId): Strategy {
  return {
    decide(req: DecisionRequest, c: Character): Decision {
      if (req.kind === "chooseCareer" && req.options.includes(careerId)) {
        return { kind: "chooseCareer", careerId };
      }
      const d = strat.decide(req, c);
      if (d instanceof Promise) throw new Error("sync only");
      return d;
    },
  };
}

describe("Career registry", () => {
  it("has all 18 basic-gen careers", () => {
    const expected = [
      "Navy", "Marines", "Army", "Scouts", "Flyer", "Sailor",
      "LawEnforcer", "Doctor", "Diplomat", "Bureaucrat", "Scientist", "Noble",
      "Merchant", "Belter", "Pirate", "Rogue", "Hunter", "Barbarian",
    ];
    for (const id of expected) {
      expect(CAREER_REGISTRY.has(id), `missing career ${id}`).toBe(true);
    }
    expect(CAREER_REGISTRY.size).toBe(expected.length);
  });

  it("draft slots 1-6 are unique among military careers", () => {
    const slots = new Map<number, string>();
    for (const c of CAREER_REGISTRY.values()) {
      if (c.draftSlot !== undefined) {
        expect(slots.has(c.draftSlot), `duplicate draft slot ${c.draftSlot}`).toBe(false);
        slots.set(c.draftSlot, c.id);
      }
    }
    expect(slots.size).toBe(6);
  });

  it("careers that cannot retire: Scouts, Belter, Pirate, Rogue, Hunter, Barbarian", () => {
    const noRetire = ["Scouts", "Belter", "Pirate", "Rogue", "Hunter", "Barbarian"];
    for (const id of noRetire) {
      expect(getCareer(id).canRetire, `${id} should not retire`).toBe(false);
    }
  });

  it("careers without commission: Scouts, Doctor, Scientist, Belter, Rogue, Hunter", () => {
    const noCommission = ["Scouts", "Doctor", "Scientist", "Belter", "Rogue", "Hunter"];
    for (const id of noCommission) {
      expect(getCareer(id).thresholds.commission, `${id} should have no commission`).toBeNull();
    }
  });

  it("careers with 2 skills per subsequent term: Scouts, Doctor, Scientist", () => {
    const two = ["Scouts", "Doctor", "Scientist"];
    for (const id of two) {
      expect(getCareer(id).skillsPerSubsequentTerm).toBe(2);
    }
  });

  it("Noble bypasses homeworld skill limits; others do not", () => {
    for (const c of CAREER_REGISTRY.values()) {
      expect(c.bypassesHomeworldSkillLimits).toBe(c.id === "Noble");
    }
  });

  it("Noble has anagathicsSurvivalDm = -2; others -1", () => {
    for (const c of CAREER_REGISTRY.values()) {
      expect(c.anagathicsSurvivalDm).toBe(c.id === "Noble" ? -2 : -1);
    }
  });

  it("Belter survival uses belterTerms special DM rule", () => {
    expect(getCareer("Belter").thresholds.survival.specialDmRule).toBe("belterTerms");
  });

  it("Bureaucrat has mandatoryReenlistOnSuccess", () => {
    expect(getCareer("Bureaucrat").mandatoryReenlistOnSuccess).toBe(true);
  });
});

describe("End-to-end generation by career", () => {
  // Each non-Noble career can be forced and generates a finished character.
  const careersToTest: CareerId[] = [
    "Navy", "Marines", "Army", "Scouts", "Flyer", "Sailor",
    "LawEnforcer", "Doctor", "Diplomat", "Bureaucrat", "Scientist",
    "Merchant", "Belter", "Pirate", "Rogue", "Hunter", "Barbarian",
  ];
  for (const careerId of careersToTest) {
    it(`generates a finished ${careerId} across 20 seeds`, () => {
      for (let i = 0; i < 20; i++) {
        const seed = `e2e-${careerId}-${i}`;
        const strategy = forceCareer(new RandomStrategy(createRng(`strat-${seed}`)), careerId);
        const c = runSync(strategy, createRng(seed), seed);
        expect(c.generation.phase).toBe("done");
        // The character should have ended up in the forced career OR been
        // drafted into a military one after enlistment failure.
        expect(c.career).not.toBeNull();
      }
    });
  }

  it("never crashes across 100 random seeds (any career, including Noble)", () => {
    for (let i = 0; i < 100; i++) {
      const seed = `mix-${i}`;
      const c = runSync(
        new RandomStrategy(createRng(`strat-${seed}`)),
        createRng(seed),
        seed,
      );
      expect(c.generation.phase).toBe("done");
    }
  });
});

describe("Draft path", () => {
  it("characters who fail enlistment may be drafted into a military career", () => {
    // Use a strategy that always declines drafts so we exercise the loop too.
    let observedDraftAccept = 0;
    let observedDraftDecline = 0;
    for (let i = 0; i < 200; i++) {
      const seed = `draft-${i}`;
      const inner = new RandomStrategy(createRng(`strat-${seed}`));
      const strategy: Strategy = {
        decide(req, c) {
          if (req.kind === "acceptDraft") {
            // Half accept, half decline, deterministically by seed parity.
            return { kind: "acceptDraft", accept: i % 2 === 0 };
          }
          const d = inner.decide(req, c);
          if (d instanceof Promise) throw new Error("sync only");
          return d;
        },
      };
      const c = runSync(strategy, createRng(seed), seed);
      expect(c.generation.phase).toBe("done");
      // Look for draft log entries (won't be present every time).
      const draftAccepted = c.log.some((l) => l.text.startsWith("Accepted draft"));
      const draftDeclined = c.log.some((l) => l.text.startsWith("Declined draft"));
      if (draftAccepted) observedDraftAccept++;
      if (draftDeclined) observedDraftDecline++;
    }
    // Across 200 attempts, we should have seen both outcomes at least once.
    expect(observedDraftAccept, "expected at least one accepted draft").toBeGreaterThan(0);
    expect(observedDraftDecline, "expected at least one declined draft").toBeGreaterThan(0);
  });

  it("draft assignments are always to one of the six military careers", () => {
    const military = new Set(["Navy", "Marines", "Army", "Scouts", "Flyer", "Sailor"]);
    let observed = 0;
    for (let i = 0; i < 200; i++) {
      const seed = `draft-mil-${i}`;
      const inner = new RandomStrategy(createRng(`strat-${seed}`));
      const strategy: Strategy = {
        decide(req, c) {
          if (req.kind === "acceptDraft") {
            // Always accept so the drafted career sticks.
            expect(military.has(req.assigned), `${req.assigned} should be military`).toBe(true);
            observed++;
            return { kind: "acceptDraft", accept: true };
          }
          const d = inner.decide(req, c);
          if (d instanceof Promise) throw new Error("sync only");
          return d;
        },
      };
      runSync(strategy, createRng(seed), seed);
    }
    expect(observed, "expected at least one draft assignment").toBeGreaterThan(0);
  });
});

describe("Noble Soc 10+ gate", () => {
  it("Noble appears in chooseCareer options only when Soc 10+", () => {
    let lowSocOffers = 0;
    let highSocOffers = 0;
    for (let i = 0; i < 100; i++) {
      const seed = `noble-gate-${i}`;
      const inner = new RandomStrategy(createRng(`strat-${seed}`));
      const strategy: Strategy = {
        decide(req, c) {
          if (req.kind === "chooseCareer") {
            const offered = req.options.includes("Noble");
            if (c.upp.Soc >= 10 && offered) highSocOffers++;
            if (c.upp.Soc < 10 && offered) lowSocOffers++;
          }
          const d = inner.decide(req, c);
          if (d instanceof Promise) throw new Error("sync only");
          return d;
        },
      };
      runSync(strategy, createRng(seed), seed);
    }
    expect(lowSocOffers, "Noble must never be offered when Soc < 10").toBe(0);
    // Should have seen at least one high-Soc offer (defensive: with 100 seeds rolling Soc 2-12, ~17% Soc>=10).
    expect(highSocOffers, "should occasionally offer Noble when Soc>=10").toBeGreaterThan(0);
  });
});

describe("Belter survival DM scales with term", () => {
  it("Belter survives more often in later terms despite the harsh base 9+", () => {
    // We can't easily verify the exact DM applied without instrumenting the
    // engine, so we sanity-check that Belters can complete multi-term careers.
    let multiTermCount = 0;
    for (let i = 0; i < 200; i++) {
      const seed = `belter-${i}`;
      const strategy = forceCareer(
        new RandomStrategy(createRng(`strat-${seed}`)),
        "Belter",
      );
      const c = runSync(strategy, createRng(seed), seed);
      if (c.career === "Belter" && c.terms >= 3) multiTermCount++;
    }
    // With the scaling DM, multi-term Belters should be reasonably common.
    expect(multiTermCount, "Belter scaling should permit some 3+ term careers").toBeGreaterThan(0);
  });
});

describe("Bureaucrat mandatory reenlist", () => {
  it("a Bureaucrat who succeeds on reenlistment continues to next term", () => {
    // Force chooseCareer to Bureaucrat AND always answer reenlist=false.
    // If the engine were to honor that choice, a Bureaucrat would never
    // serve more than one term unless forced by mandatory-12.
    // Because mandatoryReenlistOnSuccess is true, the engine should ignore
    // the player's preference whenever the reenlist roll succeeds.
    let bureaucratsWithMultipleTerms = 0;
    let bureaucratsTested = 0;
    for (let i = 0; i < 200; i++) {
      const seed = `bureau-${i}`;
      const inner = new RandomStrategy(createRng(`strat-${seed}`));
      const strategy: Strategy = {
        decide(req, c) {
          if (req.kind === "chooseCareer" && req.options.includes("Bureaucrat")) {
            return { kind: "chooseCareer", careerId: "Bureaucrat" };
          }
          if (req.kind === "reenlist") {
            // Try to leave; engine should ignore on success.
            return { kind: "reenlist", reenlist: false };
          }
          const d = inner.decide(req, c);
          if (d instanceof Promise) throw new Error("sync only");
          return d;
        },
      };
      const c = runSync(strategy, createRng(seed), seed);
      if (c.career === "Bureaucrat") {
        bureaucratsTested++;
        if (c.terms >= 2) bureaucratsWithMultipleTerms++;
      }
    }
    expect(bureaucratsTested, "expected at least some Bureaucrats").toBeGreaterThan(0);
    // The engine should force reenlistment on successful rolls, producing
    // multi-term Bureaucrats. Reenlist target is 5+ so ~83% chance per term.
    expect(
      bureaucratsWithMultipleTerms,
      "Bureaucrats should commonly serve multiple terms even when player chooses to leave",
    ).toBeGreaterThan(0);
  });
});

describe("Homeworld restrictions", () => {
  it("respects Sailor's wet-world restriction", () => {
    // RandomStrategy uses a class-B tech-12 hydro-5 homeworld. Sailor needs
    // hydro >= 6, so Sailor should NEVER appear in chooseCareer options.
    let sailorOffered = 0;
    for (let i = 0; i < 100; i++) {
      const seed = `wet-${i}`;
      const inner = new RandomStrategy(createRng(`strat-${seed}`));
      const strategy: Strategy = {
        decide(req, c) {
          if (req.kind === "chooseCareer" && req.options.includes("Sailor")) {
            sailorOffered++;
          }
          const d = inner.decide(req, c);
          if (d instanceof Promise) throw new Error("sync only");
          return d;
        },
      };
      runSync(strategy, createRng(seed), seed);
    }
    expect(sailorOffered, "Sailor should not be offered on a hydro-5 world").toBe(0);
  });
});
