/**
 * Round-trip tests: a generated character should survive
 * serialize → JSON.stringify → JSON.parse → deserialize unchanged.
 */

import { describe, it, expect } from "vitest";
import { createRng } from "../engine/rng";
import { runSync } from "../strategies/runSync";
import { RandomStrategy } from "../strategies/random";
import { serialize, deserialize, CURRENT_SCHEMA_VERSION } from "../engine/persistence";
import { newCharacter } from "../engine/advance";

describe("serialize / deserialize", () => {
  it("round-trips a fresh character", () => {
    const original = newCharacter("test-seed");
    const json = JSON.stringify(serialize(original));
    const restored = deserialize(JSON.parse(json));
    expect(restored.id).toBe(original.id);
    expect(restored.seed).toBe(original.seed);
    expect(restored.upp).toEqual(original.upp);
    expect(restored.skills).toBeInstanceOf(Map);
    expect(restored.skills.size).toBe(0);
    expect(restored.schemaVersion).toBe(original.schemaVersion);
  });

  it("round-trips a fully-generated character with skills, possessions, log", () => {
    const seed = "round-trip-1";
    const c = runSync(
      new RandomStrategy(createRng(`strat-${seed}`)),
      createRng(seed),
      seed,
    );
    const json = JSON.stringify(serialize(c));
    const restored = deserialize(JSON.parse(json));

    expect(restored.name).toBe(c.name);
    expect(restored.career).toBe(c.career);
    expect(restored.age).toBe(c.age);
    expect(restored.terms).toBe(c.terms);
    expect(restored.cash).toBe(c.cash);
    expect(restored.upp).toEqual(c.upp);
    expect(restored.possessions).toEqual(c.possessions);
    expect(restored.passages).toEqual(c.passages);
    expect(restored.log.length).toBe(c.log.length);

    // Map survival: every entry preserved
    expect(restored.skills.size).toBe(c.skills.size);
    for (const [k, v] of c.skills) {
      expect(restored.skills.get(k)).toBe(v);
    }
  });

  it("preserves generation state for mid-flight characters", () => {
    // Mid-flight = not "done". We need a character paused on a decision.
    // newCharacter() starts in 'identity' phase with pendingDecision null;
    // after a single advance() call it'd be paused with pendingDecision set.
    // Just construct it directly so we don't need to drag in advance() here.
    const c = newCharacter("mid-1");
    c.generation.phase = "term";
    c.generation.termNumber = 3;
    c.generation.pendingDecision = {
      kind: "chooseSkillTable",
      allowed: ["personalDevelopment", "serviceSkills"],
      remaining: 1,
    };
    const restored = deserialize(JSON.parse(JSON.stringify(serialize(c))));
    expect(restored.generation.phase).toBe("term");
    expect(restored.generation.termNumber).toBe(3);
    expect(restored.generation.pendingDecision?.kind).toBe("chooseSkillTable");
  });

  it("schema version is the current build's version", () => {
    const c = newCharacter("ver-1");
    expect(c.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
  });
});
