/**
 * Mustering out — STUB.
 *
 * This v1 vertical slice just marks the character "done" without rolling
 * benefits or cash. Full mustering-out logic (benefit/cash table choice,
 * passages, retirement pay) lands in the next slice.
 */

import type { Character, Decision, PhaseResult } from "../types";
import { appendLog } from "../log";

export function handleMusterOut(
  character: Character,
  _decision: Decision | undefined,
): PhaseResult {
  const updated = appendLog(character, "Mustered out (benefits to be implemented).");
  return {
    kind: "continue",
    character: {
      ...updated,
      generation: {
        ...updated.generation,
        phase: "cascadeResolution",
        pendingDecision: null,
      },
    },
  };
}
