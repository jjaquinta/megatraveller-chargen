/**
 * Serialization, schema migration, and the localStorage adapter.
 *
 * Two layers:
 *   - serialize / deserialize convert a Character to and from a plain JSON
 *     object. The output is JSON.stringify-safe.
 *   - The CharacterStore class is a thin wrapper over localStorage with one
 *     key per character plus an index key for fast listing.
 *
 * Migration:
 *   The schemaVersion on each saved character names the version of the
 *   serialization format. CURRENT_SCHEMA_VERSION is the version this build
 *   writes. migrate() runs a chain of transforms (1->2, 2->3, ...) until the
 *   stored version matches current. Add migrations to MIGRATIONS as needed.
 */

import type {
  AnagathicsState,
  CareerId,
  Character,
  GenerationState,
  LogEntry,
  ManualEdit,
  PassageHolding,
  Possession,
  SkillId,
} from "./types";

// =============================================================================
// Version
// =============================================================================

export const CURRENT_SCHEMA_VERSION = 1;

// =============================================================================
// Serialize / Deserialize
// =============================================================================

/**
 * The on-disk shape of a character. Identical to Character except that:
 *   - skills is serialized as Array<[SkillId, number]> (Map round-trip)
 *   - everything is plain JSON-safe types
 *
 * If the in-memory Character shape changes in future, the serialized shape
 * may diverge — at which point we'd bump CURRENT_SCHEMA_VERSION and add a
 * migration.
 */
export interface SerializedCharacterV1 {
  id: string;
  name: string;
  gender: string;
  race: string;
  upp: Character["upp"];
  homeworld: Character["homeworld"];
  age: number;
  career: CareerId | null;
  terms: number;
  rank: number;
  skills: Array<[SkillId, number]>;
  possessions: Possession[];
  cash: number;
  passages: PassageHolding;
  decorations: string[];
  brownie: number;
  anagathics: AnagathicsState;
  retirementPay: number;
  log: LogEntry[];
  generation: GenerationState;
  edits: ManualEdit[];
  seed: string;
  schemaVersion: number;
}

export function serialize(character: Character): SerializedCharacterV1 {
  return {
    id: character.id,
    name: character.name,
    gender: character.gender,
    race: character.race,
    upp: character.upp,
    homeworld: character.homeworld,
    age: character.age,
    career: character.career,
    terms: character.terms,
    rank: character.rank,
    skills: Array.from(character.skills.entries()),
    possessions: character.possessions,
    cash: character.cash,
    passages: character.passages,
    decorations: character.decorations,
    brownie: character.brownie,
    anagathics: character.anagathics,
    retirementPay: character.retirementPay,
    log: character.log,
    generation: character.generation,
    edits: character.edits,
    seed: character.seed,
    schemaVersion: character.schemaVersion,
  };
}

export function deserialize(data: SerializedCharacterV1): Character {
  return {
    id: data.id,
    name: data.name,
    gender: data.gender,
    race: data.race,
    upp: data.upp,
    homeworld: data.homeworld,
    age: data.age,
    career: data.career,
    terms: data.terms,
    rank: data.rank,
    skills: new Map(data.skills),
    possessions: data.possessions,
    cash: data.cash,
    passages: data.passages,
    decorations: data.decorations,
    brownie: data.brownie,
    anagathics: data.anagathics,
    retirementPay: data.retirementPay,
    log: data.log,
    generation: data.generation,
    edits: data.edits,
    seed: data.seed,
    schemaVersion: data.schemaVersion,
  };
}

// =============================================================================
// Migration
// =============================================================================

/**
 * A migration takes an opaque saved object at version N and returns the same
 * object reshaped to version N+1. Migrations are pure functions; they should
 * not throw on well-formed older data.
 *
 * The migration framework intentionally uses `unknown` because the shape of
 * old data may not match the current types.
 */
export type Migration = (data: unknown) => unknown;

/**
 * MIGRATIONS[N] is the function that transforms from version N to N+1.
 *
 * To add a new migration when bumping schema version to (say) 2:
 *   - Bump CURRENT_SCHEMA_VERSION to 2
 *   - Add MIGRATIONS[1] = (oldData) => { ... }
 *   - Update SerializedCharacterV1 to V2 (or add a new V2 type and dispatch)
 */
const MIGRATIONS: Record<number, Migration> = {
  // No migrations yet.
};

export function migrate(rawData: unknown): SerializedCharacterV1 {
  if (typeof rawData !== "object" || rawData === null) {
    throw new Error("Cannot migrate: data is not an object");
  }
  const obj = rawData as { schemaVersion?: number };
  let version = obj.schemaVersion ?? 1;
  let data: unknown = rawData;
  while (version < CURRENT_SCHEMA_VERSION) {
    const migration = MIGRATIONS[version];
    if (!migration) {
      throw new Error(`No migration registered from schema version ${version}`);
    }
    data = migration(data);
    version += 1;
  }
  if (version > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Saved character is at schema version ${version}, newer than this build supports (${CURRENT_SCHEMA_VERSION}). Update the application.`,
    );
  }
  return data as SerializedCharacterV1;
}

// =============================================================================
// Wrapper format for clipboard / import-export
// =============================================================================

/**
 * The export wrapper makes it explicit what format and version the JSON
 * represents, so future formats can be distinguished and rejected cleanly.
 */
export interface ExportEnvelope {
  format: "megatraveller-chargen";
  schemaVersion: number;
  character: SerializedCharacterV1;
}

const ENVELOPE_FORMAT = "megatraveller-chargen";

export function exportToJson(character: Character): string {
  const envelope: ExportEnvelope = {
    format: ENVELOPE_FORMAT,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    character: serialize(character),
  };
  return JSON.stringify(envelope, null, 2);
}

export function importFromJson(json: string): Character {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    throw new Error(`Invalid JSON: ${(e as Error).message}`);
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Imported data is not an object");
  }
  const envelope = parsed as Partial<ExportEnvelope>;
  if (envelope.format !== ENVELOPE_FORMAT) {
    throw new Error(
      `Unrecognized format: expected "${ENVELOPE_FORMAT}", got "${envelope.format ?? "(missing)"}".`,
    );
  }
  if (typeof envelope.schemaVersion !== "number") {
    throw new Error("Envelope is missing schemaVersion.");
  }
  if (!envelope.character) {
    throw new Error("Envelope is missing character payload.");
  }
  // Migrations operate on the inner character object, which carries its own
  // schemaVersion. The envelope-level version is informational and serves as
  // a sanity check.
  const migrated = migrate(envelope.character);
  return deserialize(migrated);
}

// =============================================================================
// Storage backend interface
// =============================================================================

/**
 * Abstract over localStorage so tests can substitute a clean in-memory
 * backend without polluting jsdom's shared storage.
 */
export interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  keys(): string[];
}

export class MemoryBackend implements StorageBackend {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  keys(): string[] {
    return Array.from(this.store.keys());
  }
}

export class LocalStorageBackend implements StorageBackend {
  getItem(key: string): string | null {
    return window.localStorage.getItem(key);
  }
  setItem(key: string, value: string): void {
    window.localStorage.setItem(key, value);
  }
  removeItem(key: string): void {
    window.localStorage.removeItem(key);
  }
  keys(): string[] {
    const out: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k !== null) out.push(k);
    }
    return out;
  }
}

// =============================================================================
// Character store
// =============================================================================

export const KEY_PREFIX = "mt-char:";
export const KEY_INDEX = "mt-char:index";

/**
 * One entry in the listing index.
 */
export interface CharacterIndexEntry {
  id: string;
  name: string;
  career: string | null;
  age: number;
  terms: number;
  generationPhase: string;
  lastModified: number; // epoch ms
  schemaVersion: number;
}

/**
 * Manages saved characters in a StorageBackend.
 *
 * Keys:
 *   mt-char:index            -> JSON CharacterIndexEntry[]
 *   mt-char:<id>             -> JSON SerializedCharacterV1
 *
 * The index is kept consistent with the per-character entries on every
 * mutation. Reading a single character is one lookup; listing is also one
 * lookup against the index.
 */
export class CharacterStore {
  constructor(private backend: StorageBackend) {}

  list(): CharacterIndexEntry[] {
    const raw = this.backend.getItem(KEY_INDEX);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as CharacterIndexEntry[];
    } catch {
      return [];
    }
  }

  get(id: string): Character | null {
    const raw = this.backend.getItem(KEY_PREFIX + id);
    if (!raw) return null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
    const migrated = migrate(parsed);
    return deserialize(migrated);
  }

  save(character: Character): void {
    const serialized = serialize(character);
    this.backend.setItem(KEY_PREFIX + character.id, JSON.stringify(serialized));
    this.updateIndex(character);
  }

  delete(id: string): void {
    this.backend.removeItem(KEY_PREFIX + id);
    const index = this.list().filter((e) => e.id !== id);
    this.backend.setItem(KEY_INDEX, JSON.stringify(index));
  }

  /**
   * Remove all characters and the index. Useful for tests; surface in UI via
   * an explicit "clear all" affordance only.
   */
  clear(): void {
    for (const key of this.backend.keys()) {
      if (key.startsWith(KEY_PREFIX)) {
        this.backend.removeItem(key);
      }
    }
  }

  private updateIndex(character: Character): void {
    const entry: CharacterIndexEntry = {
      id: character.id,
      name: character.name,
      career: character.career,
      age: character.age,
      terms: character.terms,
      generationPhase: character.generation.phase,
      lastModified: Date.now(),
      schemaVersion: character.schemaVersion,
    };
    const index = this.list();
    const existing = index.findIndex((e) => e.id === character.id);
    if (existing >= 0) {
      index[existing] = entry;
    } else {
      index.push(entry);
    }
    this.backend.setItem(KEY_INDEX, JSON.stringify(index));
  }
}

/**
 * Convenience: create a CharacterStore backed by localStorage. Will throw if
 * called in an environment without window.localStorage (e.g. Node without
 * jsdom). Use a MemoryBackend directly in tests or other non-browser
 * environments.
 */
export function createBrowserStore(): CharacterStore {
  return new CharacterStore(new LocalStorageBackend());
}
