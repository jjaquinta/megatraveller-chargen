/**
 * CharacterStore tests using MemoryBackend (no localStorage required).
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  CharacterStore,
  MemoryBackend,
  KEY_PREFIX,
  KEY_INDEX,
} from "../engine/persistence";
import { newCharacter } from "../engine/advance";
import { createRng } from "../engine/rng";
import { runSync } from "../strategies/runSync";
import { RandomStrategy } from "../strategies/random";

describe("CharacterStore", () => {
  let backend: MemoryBackend;
  let store: CharacterStore;

  beforeEach(() => {
    backend = new MemoryBackend();
    store = new CharacterStore(backend);
  });

  it("list is empty initially", () => {
    expect(store.list()).toEqual([]);
  });

  it("save then get returns the character", () => {
    const c = newCharacter("save-1");
    c.name = "Alice";
    store.save(c);
    const back = store.get(c.id);
    expect(back).not.toBeNull();
    expect(back!.id).toBe(c.id);
    expect(back!.name).toBe("Alice");
  });

  it("save updates the index", () => {
    const c = newCharacter("save-2");
    c.name = "Bob";
    store.save(c);
    const list = store.list();
    expect(list).toHaveLength(1);
    expect(list[0]!.id).toBe(c.id);
    expect(list[0]!.name).toBe("Bob");
  });

  it("saves multiple characters", () => {
    const a = newCharacter("a");
    a.name = "A";
    const b = newCharacter("b");
    b.name = "B";
    store.save(a);
    store.save(b);
    expect(store.list()).toHaveLength(2);
  });

  it("save replaces existing entry without duplicating in index", () => {
    const c = newCharacter("repl");
    c.name = "Original";
    store.save(c);
    c.name = "Updated";
    store.save(c);
    const list = store.list();
    expect(list).toHaveLength(1);
    expect(list[0]!.name).toBe("Updated");
    expect(store.get(c.id)!.name).toBe("Updated");
  });

  it("delete removes from both backend and index", () => {
    const c = newCharacter("del-1");
    store.save(c);
    expect(store.list()).toHaveLength(1);
    store.delete(c.id);
    expect(store.list()).toHaveLength(0);
    expect(store.get(c.id)).toBeNull();
    expect(backend.getItem(KEY_PREFIX + c.id)).toBeNull();
  });

  it("delete is a no-op for an unknown id", () => {
    expect(() => store.delete("nope")).not.toThrow();
  });

  it("clear removes all characters", () => {
    store.save(newCharacter("a"));
    store.save(newCharacter("b"));
    store.save(newCharacter("c"));
    store.clear();
    expect(store.list()).toHaveLength(0);
  });

  it("get returns null for unknown id", () => {
    expect(store.get("nope")).toBeNull();
  });

  it("get returns null on corrupted entry", () => {
    backend.setItem(KEY_PREFIX + "corrupt", "{not json");
    expect(store.get("corrupt")).toBeNull();
  });

  it("list returns [] when index is corrupted", () => {
    backend.setItem(KEY_INDEX, "garbage");
    expect(store.list()).toEqual([]);
  });

  it("preserves a fully-generated character through save/load", () => {
    const seed = "store-rt";
    const c = runSync(
      new RandomStrategy(createRng(`strat-${seed}`)),
      createRng(seed),
      seed,
    );
    store.save(c);
    const back = store.get(c.id)!;
    expect(back.career).toBe(c.career);
    expect(back.terms).toBe(c.terms);
    expect(back.cash).toBe(c.cash);
    expect(back.skills.size).toBe(c.skills.size);
    expect(back.log.length).toBe(c.log.length);
  });

  it("index entries carry generationPhase for the list UI", () => {
    const fresh = newCharacter("idx-1");
    const done = runSync(
      new RandomStrategy(createRng("idx-strat")),
      createRng("idx-done"),
      "idx-done",
    );
    store.save(fresh);
    store.save(done);
    const list = store.list();
    const freshEntry = list.find((e) => e.id === fresh.id)!;
    const doneEntry = list.find((e) => e.id === done.id)!;
    expect(freshEntry.generationPhase).toBe("identity");
    expect(doneEntry.generationPhase).toBe("done");
  });
});
