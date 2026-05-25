/**
 * Log helpers: append-only human-readable history.
 */

import type { Character, LogEntry } from "./types";

export function appendLog(character: Character, text: string): Character {
  const entry: LogEntry = { term: character.terms, text };
  return { ...character, log: [...character.log, entry] };
}
