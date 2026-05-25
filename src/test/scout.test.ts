/**
 * End-to-end integration test: generate Scout characters with RandomStrategy.
 *
 * This is the vertical slice's proving test. Runs many full generations,
 * verifying invariants hold throughout. Specific outcomes (skills learned,
 * terms served, etc.) vary by seed, but post-conditions must always hold.
 */

import { describe, it, expect } from "vitest";
import { createRng } from "../engine/rng";
import { runSync } from "../strategies/runSync";
import { RandomStrategy } from "../strategies/random";
import { encodeUPP } from "../engine/upp";

describe("Scout career — random end-to-end", () => {
  it("generates a finished character from seed 'seed-1'", () => {
    const rng = createRng("seed-1");
    const strategy = new RandomStrategy(createRng("strategy-1"));
    const character = runSync(strategy, rng, "seed-1");

    expect(character.generation.phase).toBe("done");
    expect(character.name).not.toBe("");
    expect(character.career).toBe("Scouts");
    expect(character.upp.Str).toBeGreaterThanOrEqual(2);
    expect(character.upp.Str).toBeLessThanOrEqual(12);
    // Verify UPP is encodable
    expect(encodeUPP(character.upp)).toMatch(/^[0-9A-F]{6}$/);
  });

  it("is deterministic given the same seeds", () => {
    const c1 = runSync(
      new RandomStrategy(createRng("strat-A")),
      createRng("rng-A"),
      "rng-A",
    );
    const c2 = runSync(
      new RandomStrategy(createRng("strat-A")),
      createRng("rng-A"),
      "rng-A",
    );
    expect(c1.upp).toEqual(c2.upp);
    expect(c1.career).toBe(c2.career);
    expect(c1.terms).toBe(c2.terms);
    expect(c1.age).toBe(c2.age);
    expect(Array.from(c1.skills.entries()).sort()).toEqual(
      Array.from(c2.skills.entries()).sort(),
    );
  });

  it("never crashes across 100 different seeds", () => {
    for (let i = 0; i < 100; i++) {
      const seed = `bulk-${i}`;
      const character = runSync(
        new RandomStrategy(createRng(`strat-${i}`)),
        createRng(seed),
        seed,
      );
      expect(character.generation.phase).toBe("done");
      // Age should be 18 + 4*completed_terms (or 18 + 4*(N-1) + 2 if last term failed survival)
      expect(character.age).toBeGreaterThanOrEqual(18);
      // Terms should be sane
      expect(character.terms).toBeGreaterThanOrEqual(0);
      expect(character.terms).toBeLessThan(20);
    }
  });

  it("logs the character's career", () => {
    const character = runSync(
      new RandomStrategy(createRng("log-strat")),
      createRng("log-rng"),
      "log-rng",
    );
    const text = character.log.map((e) => e.text).join("\n");
    expect(text).toContain("Initial UPP");
    expect(text).toMatch(/Enlisted in the Scouts|Failed to enlist/);
  });
});
