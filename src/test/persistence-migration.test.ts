/**
 * Migration framework tests.
 *
 * There are no real migrations yet, but the chain logic itself can be tested:
 *   - same-version passes through
 *   - missing schemaVersion is treated as 1
 *   - unknown future version throws
 *   - LocalStorageBackend works end-to-end against jsdom's localStorage
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  migrate,
  CURRENT_SCHEMA_VERSION,
  CharacterStore,
  LocalStorageBackend,
} from "../engine/persistence";
import { newCharacter } from "../engine/advance";

describe("migrate", () => {
  it("passes through data already at the current version", () => {
    const data = { schemaVersion: CURRENT_SCHEMA_VERSION, foo: "bar" };
    const result = migrate(data);
    expect(result).toEqual(data);
  });

  it("treats a missing schemaVersion as 1", () => {
    // Until CURRENT_SCHEMA_VERSION advances, this is a no-op. The point of
    // the test is that we accept legacy data lacking the field.
    const data = { foo: "bar" };
    const result = migrate(data);
    expect(result).toEqual(data);
  });

  it("throws on a future schema version", () => {
    const data = { schemaVersion: CURRENT_SCHEMA_VERSION + 1 };
    expect(() => migrate(data)).toThrow(/newer than this build supports/);
  });

  it("throws on non-object input", () => {
    expect(() => migrate("hello")).toThrow();
    expect(() => migrate(null)).toThrow();
  });
});

describe("LocalStorageBackend", () => {
  // jsdom provides window.localStorage, but it persists across tests in the
  // same file. Clear it before each test.
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("save / get / delete via real localStorage", () => {
    const store = new CharacterStore(new LocalStorageBackend());
    const c = newCharacter("ls-1");
    c.name = "Persisted";
    store.save(c);

    // Reading via a fresh store instance should still find the character.
    const fresh = new CharacterStore(new LocalStorageBackend());
    expect(fresh.list()).toHaveLength(1);
    const back = fresh.get(c.id);
    expect(back).not.toBeNull();
    expect(back!.name).toBe("Persisted");

    fresh.delete(c.id);
    expect(fresh.list()).toHaveLength(0);
    expect(fresh.get(c.id)).toBeNull();
  });

  it("keys() returns all stored keys", () => {
    const backend = new LocalStorageBackend();
    backend.setItem("foo", "1");
    backend.setItem("bar", "2");
    const keys = backend.keys();
    expect(keys).toContain("foo");
    expect(keys).toContain("bar");
  });

  it("clear removes only character-prefixed keys", () => {
    const backend = new LocalStorageBackend();
    // Pre-existing unrelated key
    backend.setItem("unrelated-key", "leave-me-alone");

    const store = new CharacterStore(backend);
    store.save(newCharacter("a"));
    store.save(newCharacter("b"));

    store.clear();
    expect(store.list()).toHaveLength(0);
    expect(backend.getItem("unrelated-key")).toBe("leave-me-alone");
  });
});
