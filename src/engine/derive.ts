/**
 * Read-only derived views over a Character.
 *
 * Pure functions. Nothing here mutates state. Used by the sheet and editor
 * to compute display strings, summaries, and a one-line resume.
 */

import type { Character } from "./types";
import { encodeUPP } from "./upp";
import { getCareer } from "../data";

export function rankName(character: Character): string | null {
  if (!character.career) return null;
  if (character.rank === 0) return null;
  const career = getCareer(character.career);
  const r = career.ranks[character.rank - 1];
  return r ?? null;
}

/** A one-line summary suitable for the character-list row. */
export function summaryLine(character: Character): string {
  const upp = encodeUPP(character.upp);
  const career = character.career ?? "(no career)";
  const rank = rankName(character);
  const rankBit = rank ? ` ${rank}` : "";
  const terms = `${character.terms}T`;
  const age = `age ${character.age}`;
  return `${upp}  ${career}${rankBit}  ${terms}  ${age}`;
}

/** A status string for the index entry (sheet view label). */
export function phaseLabel(phase: string, termNumber: number): string {
  switch (phase) {
    case "identity": return "Not started";
    case "chooseCareer": return "Choosing career";
    case "enlistment": return "Enlisting";
    case "term": return `Term ${termNumber}`;
    case "reenlist": return `End of term ${termNumber}`;
    case "musterOut": return "Mustering out";
    case "cascadeResolution": return "Resolving cascades";
    case "done": return "Finished";
    default: return phase;
  }
}

/** A multiline resume of the character, suitable for clipboard or display. */
export function resumeText(character: Character): string {
  const lines: string[] = [];
  lines.push(`${character.name || "(unnamed)"} (${character.race}, ${character.gender || "—"})`);
  lines.push(`UPP ${encodeUPP(character.upp)}`);
  if (character.homeworld) {
    const h = character.homeworld;
    lines.push(`Homeworld: ${h.starport}-class, tech ${h.techLevel}, pop ${h.population}, law ${h.lawLevel}`);
  }
  lines.push(`Age ${character.age}, ${character.terms} term${character.terms === 1 ? "" : "s"} served`);
  if (character.career) {
    const career = getCareer(character.career);
    const rn = rankName(character);
    lines.push(`Career: ${career.name}${rn ? ` (${rn})` : ""}`);
  }
  const skills = Array.from(character.skills.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${k}-${v}`)
    .join(", ");
  if (skills) lines.push(`Skills: ${skills}`);
  if (character.possessions.length > 0) {
    lines.push(`Possessions: ${character.possessions.map((p) => p.description).join("; ")}`);
  }
  const psg = character.passages;
  if (psg.high + psg.middle + psg.low > 0) {
    lines.push(`Passages: H${psg.high} M${psg.middle} L${psg.low}`);
  }
  if (character.cash > 0) lines.push(`Cash: Cr${character.cash.toLocaleString()}`);
  if (character.retirementPay > 0) {
    lines.push(`Retirement pay: Cr${character.retirementPay.toLocaleString()}/yr`);
  }
  if (character.decorations.length > 0) {
    lines.push(`Decorations: ${character.decorations.join(", ")}`);
  }
  return lines.join("\n");
}
