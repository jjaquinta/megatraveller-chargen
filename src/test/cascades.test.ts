import { describe, it, expect } from "vitest";
import { createRng } from "../engine/rng";
import { runSync } from "../strategies/runSync";
import { RandomStrategy } from "../strategies/random";

describe("Cascade resolution", () => {
  it("leaves no cascade parents in the final skills map", () => {
    const cascadeParents = new Set([
      "Physical", "Mental", "Inborn",
      "Vice", "GunCombat", "BladeCombat", "HandCombat",
      "Vehicle", "SpaceCombat", "Space", "Technical",
      "Interpersonal", "SpecialCombat",
    ]);
    for (let i = 0; i < 100; i++) {
      const seed = `cascade-${i}`;
      const c = runSync(
        new RandomStrategy(createRng(`strat-${seed}`)),
        createRng(seed),
        seed,
      );
      for (const skillId of c.skills.keys()) {
        expect(cascadeParents.has(skillId)).toBe(false);
      }
    }
  });

  it("clears pendingCascades on completion", () => {
    for (let i = 0; i < 30; i++) {
      const seed = `cascade-pending-${i}`;
      const c = runSync(
        new RandomStrategy(createRng(`strat-${seed}`)),
        createRng(seed),
        seed,
      );
      expect(c.generation.pendingCascades).toEqual([]);
    }
  });
});
