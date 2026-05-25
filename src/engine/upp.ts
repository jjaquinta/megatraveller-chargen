/**
 * UPP helpers: hex encoding/decoding, clamping, and characteristic-modifier
 * computation for tasks.
 */

import type { CharacteristicName, UPP } from "./types";
import { CHARACTERISTIC_ORDER } from "./types";

/** Encode a single characteristic value (0–15+) as one hex char. */
export function encodeChar(value: number): string {
  if (value < 0) return "0";
  if (value <= 9) return String(value);
  if (value <= 15) return "ABCDEF"[value - 10] ?? "F";
  // For display, "F" is the highest single-char. Above 15 is rare and we
  // currently cap at 15 for player characters.
  return "F";
}

/** Decode a single hex character back to a numeric value. */
export function decodeChar(ch: string): number {
  if (ch >= "0" && ch <= "9") return ch.charCodeAt(0) - 48;
  const up = ch.toUpperCase();
  if (up >= "A" && up <= "F") return up.charCodeAt(0) - 55; // 'A' = 10
  throw new Error(`Invalid UPP character: ${ch}`);
}

/** Encode the full UPP as a six-character hex string. */
export function encodeUPP(upp: UPP): string {
  return CHARACTERISTIC_ORDER.map((c) => encodeChar(upp[c])).join("");
}

/** Decode a six-character UPP string. */
export function decodeUPP(s: string): UPP {
  if (s.length !== 6) throw new Error(`UPP must be 6 chars; got "${s}"`);
  const out: Partial<UPP> = {};
  CHARACTERISTIC_ORDER.forEach((c, i) => {
    out[c] = decodeChar(s[i]!);
  });
  return out as UPP;
}

/**
 * Clamp a characteristic to its legal range. Player-character values may not
 * exceed 15; they do not go below 1 except as a result of calamitous injury
 * or aging (the engine allows 0 during aging so the crisis can fire).
 */
export function clampChar(value: number): number {
  if (value < 0) return 0;
  if (value > 15) return 15;
  return value;
}

/** Apply a delta to a single characteristic, returning a new UPP. */
export function applyDelta(upp: UPP, stat: CharacteristicName, delta: number): UPP {
  return { ...upp, [stat]: clampChar(upp[stat] + delta) };
}
