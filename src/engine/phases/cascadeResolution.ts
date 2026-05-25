/**
 * Cascade resolution — STUB.
 *
 * v1: skip and mark done. Real flow asks the user to resolve each pending
 * cascade with mayDefer:false. Lands in the next slice.
 */

import type { Character, Decision, PhaseResult } from "../types";

export function handleCascadeResolution(
  character: Character,
  _decision: Decision | undefined,
): PhaseResult {
  return {
    kind: "done",
    character: {
      ...character,
      generation: {
        ...character.generation,
        phase: "done",
        pendingDecision: null,
      },
    },
  };
}
