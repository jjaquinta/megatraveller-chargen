/**
 * End-to-end integration test for Scout characters specifically.
 *
 * Uses a forced-career strategy that always picks Scouts on chooseCareer.
 * This keeps the test stable as more careers are added.
 */

import { describe, it, expect } from "vitest";
import { createRng } from "../engine/rng";
import { runSync } from "../strategies/runSync";
import { RandomStrategy } from "../strategies/random";
import { encodeUPP } from "../engine/upp";
import type { Strategy } from "../strategies/types";
import type { Decision, DecisionRequest, Character } from "../engine/types";

/** Wraps RandomStrategy but forces the chosen career to a specific id. */
class ForcedCareerStrategy implements Strategy {
  constructor(private inner: RandomStrategy, private careerId: string) {}
  decide(req: DecisionRequest, c: Character): Decision {
    if (req.kind === "chooseCareer") {
      // If Scouts isn't in the offered options (e.g. homeworld restriction),
      // fall back to the inner random pick.
      if (req.options.includes(this.careerId)) {
        return { kind: "chooseCareer", careerId: this.careerId };
      }
    }
    const d = this.inner.decide(req, c);
    if (d instanceof Promise) throw new Error("expected sync");
    return d;
  }
}

describe("Scout career — forced random end-to-end", () => {
  it("generates a finished Scout from seed 'seed-1'", () => {
    const rng = createRng("seed-1");
    const strategy = new ForcedCareerStrategy(
      new RandomStrategy(createRng("strategy-1")),
      "Scouts",
    );
    const character = runSync(strategy, rng, "seed-1");

    expect(character.generation.phase).toBe("done");
    expect(character.name).not.toBe("");
    expect(character.career).toBe("Scouts");
    expect(character.upp.Str).toBeGreaterThanOrEqual(0);
    expect(character.upp.Str).toBeLessThanOrEqual(15);
    expect(encodeUPP(character.upp)).toMatch(/^[0-9A-F]{6}$/);
  });

  it("is deterministic given the same seeds", () => {
    const buildStrategy = () =>
      new ForcedCareerStrategy(new RandomStrategy(createRng("strat-A")), "Scouts");
    const c1 = runSync(buildStrategy(), createRng("rng-A"), "rng-A");
    const c2 = runSync(buildStrategy(), createRng("rng-A"), "rng-A");
    expect(c1.upp).toEqual(c2.upp);
    expect(c1.career).toBe(c2.career);
    expect(c1.terms).toBe(c2.terms);
    expect(c1.age).toBe(c2.age);
    expect(Array.from(c1.skills.entries()).sort()).toEqual(
      Array.from(c2.skills.entries()).sort(),
    );
  });

  it("never crashes across 100 different seeds (any career)", () => {
    for (let i = 0; i < 100; i++) {
      const seed = `bulk-${i}`;
      const character = runSync(
        new RandomStrategy(createRng(`strat-${i}`)),
        createRng(seed),
        seed,
      );
      expect(character.generation.phase).toBe("done");
      expect(character.age).toBeGreaterThanOrEqual(18);
      expect(character.terms).toBeGreaterThanOrEqual(0);
      expect(character.terms).toBeLessThan(20);
    }
  });

  it("logs the character's career", () => {
    const character = runSync(
      new ForcedCareerStrategy(new RandomStrategy(createRng("log-strat")), "Scouts"),
      createRng("log-rng"),
      "log-rng",
    );
    const text = character.log.map((e) => e.text).join("\n");
    expect(text).toContain("Initial UPP");
    expect(text).toMatch(/Enlisted in the Scouts|Failed to enlist/);
  });
});
