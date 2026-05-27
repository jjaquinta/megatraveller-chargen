import { useRef, useState, type JSX } from "react";
import { useApp } from "../state/AppState";
import { phaseLabel } from "../../engine/derive";
import { exportToJson, importFromJson } from "../../engine/persistence";
import { runSync } from "../../strategies/runSync";
import { RandomStrategy } from "../../strategies/random";
import { createRandomRng, createRng } from "../../engine/rng";

export function CharacterList(): JSX.Element {
  const { state, store, openCharacter, openEditor, deleteCharacter, saveCharacter, setError } = useApp();
  const [importOpen, setImportOpen] = useState(false);
  const importTextRef = useRef<HTMLTextAreaElement>(null);

  function newRandom(): void {
    // Two independent RNG seeds: one for the engine's dice, one for the
    // strategy's choices. Both are derived from a fresh entropy source so a
    // fresh "New (random)" click produces a different character each time.
    const rngSeed = createRandomRng().seed;
    const strategySeed = createRandomRng().seed;
    try {
      const c = runSync(
        new RandomStrategy(createRng(strategySeed)),
        createRng(rngSeed),
        rngSeed,
      );
      saveCharacter(c);
      openCharacter(c.id);
    } catch (e) {
      setError(`Failed to generate random character: ${(e as Error).message}`);
    }
  }

  function doImport(): void {
    const text = importTextRef.current?.value ?? "";
    if (!text.trim()) {
      setError("Paste a character JSON to import.");
      return;
    }
    try {
      const c = importFromJson(text);
      saveCharacter(c);
      setImportOpen(false);
      openCharacter(c.id);
    } catch (e) {
      setError(`Import failed: ${(e as Error).message}`);
    }
  }

  function copyToClipboard(id: string): void {
    const c = store.get(id);
    if (!c) {
      setError(`Could not load character ${id}.`);
      return;
    }
    void navigator.clipboard.writeText(exportToJson(c)).catch((e) => {
      setError(`Copy failed: ${(e as Error).message}`);
    });
  }

  return (
    <div>
      <div className="toolbar">
        <h1 style={{ margin: 0 }}>Characters</h1>
        <div className="spacer" />
        <button className="primary" onClick={newRandom}>
          New (random)
        </button>
        <button onClick={() => setImportOpen(true)}>Import from clipboard</button>
      </div>

      {state.error && (
        <div className="error">
          {state.error}
          <button
            style={{ float: "right", padding: "0.1rem 0.5rem", marginTop: "-0.2rem" }}
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {state.index.length === 0 && (
        <p className="muted">
          No saved characters. Click <strong>New (random)</strong> to generate one, or paste an
          exported character via <strong>Import from clipboard</strong>.
        </p>
      )}

      {state.index.map((entry) => (
        <div key={entry.id} className="list-row">
          <div
            className="clickable-area"
            style={{ cursor: "pointer" }}
            onClick={() => openCharacter(entry.id)}
          >
            <div className="primary-text">
              {entry.name || <span className="muted">(unnamed)</span>}
            </div>
            <div className="meta">
              <span className={`tag ${entry.generationPhase === "done" ? "done" : "in-progress"}`}>
                {phaseLabel(entry.generationPhase, 0)}
              </span>
              {entry.career || "no career"} · {entry.terms} term{entry.terms === 1 ? "" : "s"} ·
              age {entry.age}
            </div>
          </div>
          <div className="actions">
            <button onClick={() => openCharacter(entry.id)}>Open</button>
            <button onClick={() => openEditor(entry.id)}>Edit</button>
            <button onClick={() => copyToClipboard(entry.id)}>Copy</button>
            <button
              className="danger"
              onClick={() => {
                if (confirm(`Delete "${entry.name || "(unnamed)"}"? This cannot be undone.`)) {
                  deleteCharacter(entry.id);
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {importOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setImportOpen(false);
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              padding: "1rem",
              borderRadius: "var(--radius)",
              maxWidth: "560px",
              width: "90%",
            }}
          >
            <h2>Import character</h2>
            <p className="muted">Paste the JSON of an exported character below.</p>
            <textarea
              ref={importTextRef}
              rows={12}
              autoFocus
              style={{ width: "100%" }}
              placeholder='{"format":"megatraveller-chargen", ...}'
            />
            <div className="row" style={{ marginTop: "0.6rem", justifyContent: "flex-end" }}>
              <button onClick={() => setImportOpen(false)}>Cancel</button>
              <button className="primary" onClick={doImport}>
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
