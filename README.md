# MegaTraveller Character Generator

A browser-based character generator for the MegaTraveller RPG. Static site —
no backend, no accounts, characters persist in `localStorage`.

## Status

Scaffold. Engine and UI to be filled in.

## Quick start

```bash
npm install
npm run dev      # local dev server
npm run test     # unit tests (vitest)
npm run build    # production build into dist/
npm run preview  # serve the production build locally
npm run lint     # eslint
npm run format   # prettier
```

The built `dist/` is a static site. It runs from any static host (GitHub Pages
will be wired up in a later commit) and can also be opened directly from disk —
asset paths are relative (`base: "./"` in `vite.config.ts`).

## Architectural decisions

These are deliberate and worth knowing before changing code.

### Two layers, hard wall

- `src/engine/` — pure TypeScript, no React, no DOM. The rules of MegaTraveller
  character generation expressed as code.
- `src/ui/` — React. A thin shell that drives the engine.
- `src/data/` — career and skill definitions, as **pure data**. No code in
  career definitions (see "Exception handling" below).
- `src/strategies/` — pluggable decision-makers. The interactive UI is one
  strategy; auto-mode batch generators are others.

### Engine API: one function, resumable

The engine exposes a single function:

```ts
advance(character, decision?, rng) -> GenerationResult
```

where `GenerationResult` is either `{ kind: "needDecision", decision, character }`
or `{ kind: "done", character }`.

The engine never persists anything. The caller calls `advance` in a loop,
supplying the appropriate `Decision` each time the engine pauses. This makes
the engine equally drivable by:

- a React wizard (decisions resolved by user clicks)
- a `RandomStrategy` for testing
- a `DiverseStrategy` / `MaximizeStrategy` for auto-mode batch generation
- a future scriptable interface

### Character state is direct, not computed

`Character.upp`, `Character.skills`, `Character.cash` etc. are direct fields, not
derivations over an event history. A lightweight `Character.log` records
human-readable summary events ("Promoted to Lieutenant Commander", "Learned
Steward-1", "Failed survival in term 4") suitable for a resume and as fodder
for a future AI prose-history feature. The log is not the source of truth and
is not used to reconstruct state.

The trade-off: no full undo/redo, no precise "show me the die roll that
produced this skill." We considered both and decided neither is worth the
complexity tax on every read of the character.

### Data-driven careers, exceptions in engine code

Each of the 18 basic-generation careers is a `CareerDef` data object in
`src/data/careers/`. The shape is uniform: thresholds, DM rules, skill tables,
mustering-out tables, plus flags for things like `canRetire`,
`skillsPerSubsequentTerm`, `bypassesHomeworldSkillLimits`.

An audit of basic character generation found ~1–2 genuine special-case rules
(Belter survival DM scales with terms; Noble takes -2 instead of -1 on
anagathics survival DM). These are handled in the engine via named flags
(`specialDmRule: "belterTerms"`) checked in one place per rule — **not** via
function hooks in data files. Data files contain only data.

When advanced character generation lands, expect a couple more named flags. If
the count grows large enough that the engine's `switch` blocks become
unmanageable, we revisit. For now, the simpler model wins.

### Cascade skills

Skills like "Gun Combat" cascade to a specific weapon choice. The engine
treats the parent (cascade) skill as a regular skill and lets the chooser
either pick a specific child immediately (`{ kind: "specific", child }`) or
defer (`{ kind: "defer" }`), in which case the count accumulates on the
parent. At the end of generation, any non-zero cascade counts trigger
forced-resolution decisions — same `resolveCascade` request type, but with
`mayDefer: false`.

### Persistence

- Primary: `localStorage`, one key per character (`mt-char:{uuid}`), plus an
  index key (`mt-char:index`).
- Secondary: clipboard import/export of JSON for sharing and backup.
- Every saved character carries a `schemaVersion`. `engine/persistence.ts`
  contains a migration chain (`migrate1to2`, etc.). v1 has nothing to migrate
  yet, but the chain is in place.

### Random number generation

Seedable PRNG (mulberry32). Seeded from `crypto.getRandomValues` at startup,
or from a user-supplied seed. The seed is stored on the character so a
generated character can be replayed if needed. `Math.random()` is not used.

## Directory layout

```
src/
  engine/         pure TS, no React
    advance.ts        the resumable generation entry point
    types.ts          domain types
    rng.ts, dice.ts, upp.ts
    derive.ts         read-only views (resume text, etc.)
    persistence.ts    serialize / migrate
    log.ts
    phases/           one file per phase of the state machine
    rules/            pure helpers used by phases
  data/           pure data, no logic
    careers/          one file per career (18 in basic gen)
    skills.ts         skill registry with cascade metadata
    homeworld.ts      homeworld code tables
    benefitObjects.ts mustering-out benefit catalog
  strategies/     pluggable decision-makers
    types.ts, interactive.ts, random.ts, diverse.ts, maximize.ts
  ui/             React shell
    App.tsx
    screens/Wizard/   one component per decision kind
    screens/Editor/   free-form post-generation editor
    screens/AutoMode/ batch generation UI
    components/
    state/            useReducer + context
    persistence/      localStorage adapter, clipboard I/O
  test/           cross-cutting tests
```

## Editor scope

After generation completes, the character can be edited free-form. Editable
fields: name, gender, UPP, skill levels, possessions, cash, decorations,
retirement pay, age. The log is read-only. The `generation` block (phase,
pending cascades) is hidden in edit mode — it's frozen metadata.

## Active vs saved characters

Multiple characters can be saved in `localStorage`. Exactly one is *active*
for generation at a time. A character is either:

- *generating* (`character.generation.phase !== "done"`) — wizard resumes from
  its stored `pendingDecision`
- *finished* (`phase === "done"`) — opens in the sheet/editor

The character's state is fully serializable at every pause point, so closing
the tab mid-generation loses nothing.

## License

TBD.
