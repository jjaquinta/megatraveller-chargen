/**
 * Strategy interface — one method, decide(request, character) -> Decision.
 *
 * Sync strategies (e.g. random, deterministic test strategies) return a
 * Decision directly. The interactive UI strategy returns Promise<Decision>
 * and resolves it when the user clicks. The generate() helper handles both.
 */

import type { Character, Decision, DecisionRequest } from "../engine/types";

export interface Strategy {
  decide(request: DecisionRequest, character: Character): Decision | Promise<Decision>;
}
