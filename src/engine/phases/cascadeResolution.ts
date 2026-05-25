/**
 * End-of-generation cascade resolution.
 *
 * Walks the character's pendingCascades list, issuing one resolveCascade
 * decision per pending cascade. mayDefer is false (this is the final sweep).
 *
 * For each cascade, all "count" levels of the parent are resolved at once —
 * the player chooses one child per level. v1 simplification: one decision
 * per *cascade type*, all levels go into the chosen child. (i.e., if a
 * character banked Gun Combat-2, the player picks one child and gets that
 * child at +2.) The book is slightly ambiguous here; the cleaner
 * interpretation is "for each level, choose a child" — but that's a stream
 * of N nearly-identical decisions. We can refine later if requested.
 *
 * The Physical / Mental / Inborn parents are special: their children are
 * stat bumps, not skills. We resolve them with a separate flow.
 */

import type {
  CharacteristicName,
  Character,
  Decision,
  DecisionRequest,
  PhaseResult,
  SkillId,
} from "../types";
import { appendLog } from "../log";
import { getSkill } from "../../data/skills";
import { applyDelta } from "../upp";

// Special cascade parents whose children are stat bumps.
const STAT_BUMP_CASCADES: Record<string, CharacteristicName[]> = {
  Physical: ["Str", "Dex", "End"],
  Mental: ["Int", "Edu"],
  Inborn: ["Int", "Edu", "Soc"],
};

export function handleCascadeResolution(
  character: Character,
  decision: Decision | undefined,
): PhaseResult {
  // Process pending decision first.
  if (character.generation.pendingDecision?.kind === "resolveCascade" && decision) {
    if (decision.kind !== "resolveCascade") throw new Error("Expected resolveCascade");
    return applyResolveCascade(character, decision);
  }

  // Find the next unresolved cascade with non-zero count.
  const next = character.generation.pendingCascades.find(
    (id) => (character.skills.get(id) ?? 0) > 0,
  );
  if (!next) {
    // Done. Clear any leftover entries (those with count 0) and finish.
    return {
      kind: "done",
      character: {
        ...character,
        generation: {
          ...character.generation,
          phase: "done",
          pendingDecision: null,
          pendingCascades: [],
        },
      },
    };
  }

  // Build options.
  const statBumps = STAT_BUMP_CASCADES[next];
  if (statBumps) {
    // Pseudo-cascade: options are the stat names cast as SkillIds.
    const request: DecisionRequest = {
      kind: "resolveCascade",
      parent: next,
      options: statBumps as readonly string[] as SkillId[],
      mayDefer: false,
      currentLevels: Object.fromEntries(character.skills) as Record<SkillId, number>,
    };
    return {
      kind: "needDecision",
      decision: request,
      character: {
        ...character,
        generation: { ...character.generation, pendingDecision: request },
      },
    };
  }

  const parent = getSkill(next);
  const options = parent.cascadeOptions ?? [];
  if (options.length === 0) {
    // No defined children — drop with a log line.
    const updated = appendLog(
      { ...character, skills: removeSkill(character.skills, next) },
      `Cascade ${next} has no defined children; skipped.`,
    );
    return { kind: "continue", character: updated };
  }
  const request: DecisionRequest = {
    kind: "resolveCascade",
    parent: next,
    options: [...options],
    mayDefer: false,
    currentLevels: Object.fromEntries(character.skills) as Record<SkillId, number>,
  };
  return {
    kind: "needDecision",
    decision: request,
    character: {
      ...character,
      generation: { ...character.generation, pendingDecision: request },
    },
  };
}

function applyResolveCascade(character: Character, decision: Decision): PhaseResult {
  if (decision.kind !== "resolveCascade") throw new Error("Expected resolveCascade");
  if (decision.choice.kind === "defer") {
    // Not allowed at this stage — fall through to no-op and reissue.
    return {
      kind: "continue",
      character: { ...character, generation: { ...character.generation, pendingDecision: null } },
    };
  }
  const parent = (character.generation.pendingDecision as { parent: SkillId }).parent;
  const child = decision.choice.child;
  const count = character.skills.get(parent) ?? 0;

  let updated = character;
  if (STAT_BUMP_CASCADES[parent]) {
    const stat = child as unknown as CharacteristicName;
    updated = { ...updated, upp: applyDelta(updated.upp, stat, count) };
    updated = appendLog(updated, `Resolved ${parent} (${count}): +${count} ${stat}.`);
  } else {
    const currentChild = updated.skills.get(child) ?? 0;
    const newSkills = removeSkill(updated.skills, parent);
    newSkills.set(child, currentChild + count);
    updated = { ...updated, skills: newSkills };
    updated = appendLog(
      updated,
      `Resolved ${parent} (${count}): ${child}-${currentChild + count}.`,
    );
  }

  // Clear this cascade from skills and pending list.
  updated = {
    ...updated,
    skills: removeSkill(updated.skills, parent),
    generation: {
      ...updated.generation,
      pendingDecision: null,
      pendingCascades: updated.generation.pendingCascades.filter((c) => c !== parent),
    },
  };

  return { kind: "continue", character: updated };
}

function removeSkill(skills: Map<SkillId, number>, id: SkillId): Map<SkillId, number> {
  const m = new Map(skills);
  m.delete(id);
  return m;
}
