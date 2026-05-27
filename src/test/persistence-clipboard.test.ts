/**
 * Tests for clipboard-style import/export with the ExportEnvelope.
 */

import { describe, it, expect } from "vitest";
import {
  exportToJson,
  importFromJson,
  CURRENT_SCHEMA_VERSION,
} from "../engine/persistence";
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

describe("export / import", () => {
  it("export produces valid JSON with the expected envelope", () => {
    const c = genCharacter("exp-1");
    const json = exportToJson(c);
    const parsed = JSON.parse(json);
    expect(parsed.format).toBe("megatraveller-chargen");
    expect(parsed.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(parsed.character).toBeDefined();
    expect(parsed.character.id).toBe(c.id);
  });

  it("round-trips a character via export/import", () => {
    const c = genCharacter("exp-2");
    const json = exportToJson(c);
    const back = importFromJson(json);
    expect(back.id).toBe(c.id);
    expect(back.career).toBe(c.career);
    expect(back.upp).toEqual(c.upp);
    expect(back.skills.size).toBe(c.skills.size);
    for (const [k, v] of c.skills) {
      expect(back.skills.get(k)).toBe(v);
    }
  });

  it("import rejects malformed JSON with a clear error", () => {
    expect(() => importFromJson("{not json")).toThrow(/Invalid JSON/);
  });

  it("import rejects a non-envelope payload", () => {
    expect(() => importFromJson(JSON.stringify({ hello: "world" }))).toThrow(
      /Unrecognized format/,
    );
  });

  it("import rejects an envelope from a different application", () => {
    const payload = {
      format: "some-other-game",
      schemaVersion: 1,
      character: {},
    };
    expect(() => importFromJson(JSON.stringify(payload))).toThrow(
      /Unrecognized format/,
    );
  });

  it("import rejects an envelope with no schemaVersion", () => {
    const payload = {
      format: "megatraveller-chargen",
      character: {},
    };
    expect(() => importFromJson(JSON.stringify(payload))).toThrow(
      /missing schemaVersion/,
    );
  });

  it("import rejects an envelope with no character payload", () => {
    const payload = {
      format: "megatraveller-chargen",
      schemaVersion: 1,
    };
    expect(() => importFromJson(JSON.stringify(payload))).toThrow(
      /missing character/,
    );
  });

  it("import rejects a character with a newer schema version than supported", () => {
    const c = genCharacter("exp-newer");
    const json = exportToJson(c);
    const parsed = JSON.parse(json);
    parsed.character.schemaVersion = CURRENT_SCHEMA_VERSION + 1;
    expect(() => importFromJson(JSON.stringify(parsed))).toThrow(
      /newer than this build supports/,
    );
  });
});
