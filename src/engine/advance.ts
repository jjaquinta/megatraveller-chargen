// The single entry point for generation:
//   advance(character, decision?, rng) -> { kind: "needDecision", ... } | { kind: "done", ... }
// Dispatches to the appropriate phase handler based on character.generation.phase.
// Filled in next pass.
export {};
