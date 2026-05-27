import { describe, it, expect } from "vitest";
import { rankName, summaryLine, phaseLabel, resumeText } from "../engine/derive";
import { newCharacter } from "../engine/advance";
import { runSync } from "../strategies/runSync";
import { RandomStrategy } from "../strategies/random";
import { createRng } from "../engine/rng";
import type { Character, Decision, DecisionRequest } from "../engine/types";
import type { Strategy } from "../strategies/types";

describe("derive", () => {
  it("rankName is null for no career", () => {
    const c = newCharacter("d-1");
    expect(rankName(c)).toBeNull();
  });

  it("rankName is null for rank 0", () => {
    const c = newCharacter("d-2");
    c.career = "Navy";
    c.rank = 0;
    expect(rankName(c)).toBeNull();
  });

  it("rankName resolves the rank label", () => {
    const c = newCharacter("d-3");
    c.career = "Navy";
    c.rank = 1;
    expect(rankName(c)).toBe("Ensign");
    c.rank = 4;
    expect(rankName(c)).toBe("Commander");
  });

  it("summaryLine includes UPP, career, terms, age", () => {
    const c = newCharacter("d-4");
    c.upp = { Str: 7, Dex: 8, End: 9, Int: 10, Edu: 11, Soc: 12 };
    c.career = "Scouts";
    c.terms = 3;
    c.age = 30;
    const s = summaryLine(c);
    expect(s).toContain("789ABC");
    expect(s).toContain("Scouts");
    expect(s).toContain("3T");
    expect(s).toContain("age 30");
  });

  it("phaseLabel for each known phase", () => {
    expect(phaseLabel("identity", 0)).toBe("Not started");
    expect(phaseLabel("term", 3)).toBe("Term 3");
    expect(phaseLabel("done", 0)).toBe("Finished");
    expect(phaseLabel("musterOut", 0)).toBe("Mustering out");
  });

  it("resumeText is multi-line and includes core data", () => {
    // Use a forced-career strategy to ensure a deterministic Navy character.
    const forceNavy: Strategy = {
      decide(req: DecisionRequest, c: Character): Decision {
        if (req.kind === "chooseCareer" && req.options.includes("Navy")) {
          return { kind: "chooseCareer", careerId: "Navy" };
        }
        const inner = new RandomStrategy(createRng("derive-r-strat"));
        const d = inner.decide(req, c);
        if (d instanceof Promise) throw new Error("sync only");
        return d;
      },
    };
    const c = runSync(forceNavy, createRng("derive-r-rng"), "derive-r-rng");
    const r = resumeText(c);
    expect(r).toContain("UPP");
    expect(r).toContain("Age");
    expect(r.split("\n").length).toBeGreaterThanOrEqual(3);
  });
});
