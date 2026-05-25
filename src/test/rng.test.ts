import { describe, it, expect } from "vitest";
import { createRng } from "../engine/rng";

describe("RNG", () => {
  it("produces reproducible sequences from the same seed", () => {
    const a = createRng("hello");
    const b = createRng("hello");
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences from different seeds", () => {
    const a = createRng("hello");
    const b = createRng("world");
    expect(a.next()).not.toBe(b.next());
  });

  it("produces values in [0, 1)", () => {
    const r = createRng("test");
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("rolls 1D between 1 and 6 inclusive", async () => {
    const { roll1d } = await import("../engine/dice");
    const r = createRng("dice");
    for (let i = 0; i < 1000; i++) {
      const d = roll1d(r);
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
  });

  it("rolls 2D with correct sum and DM application", async () => {
    const { roll2d } = await import("../engine/dice");
    const r = createRng("2d");
    for (let i = 0; i < 100; i++) {
      const roll = roll2d(r, 2);
      expect(roll.total).toBe(roll.faces[0]! + roll.faces[1]!);
      expect(roll.total).toBeGreaterThanOrEqual(2);
      expect(roll.total).toBeLessThanOrEqual(12);
      expect(roll.effective).toBe(roll.total + 2);
    }
  });
});
