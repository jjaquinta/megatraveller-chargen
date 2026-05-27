import { useEffect, useState, type JSX } from "react";
import { useApp } from "../state/AppState";
import type { Character } from "../../engine/types";
import { CharacterSummary } from "../components/CharacterSummary";
import { SkillList } from "../components/SkillList";
import { LogView } from "../components/LogView";
import { exportToJson } from "../../engine/persistence";
import { phaseLabel } from "../../engine/derive";

export function CharacterSheet({ id }: { id: string }): JSX.Element {
  const { store, openEditor, deleteCharacter, goHome, setError } = useApp();
  const [character, setCharacter] = useState<Character | null>(() => store.get(id));

  // Re-read on id change.
  useEffect(() => {
    setCharacter(store.get(id));
  }, [id, store]);

  if (!character) {
    return (
      <div>
        <div className="toolbar">
          <button onClick={goHome}>← Back</button>
        </div>
        <div className="error">Character {id} not found.</div>
      </div>
    );
  }

  function doCopy(): void {
    if (!character) return;
    void navigator.clipboard.writeText(exportToJson(character)).catch((e) => {
      setError(`Copy failed: ${(e as Error).message}`);
    });
  }

  const isDone = character.generation.phase === "done";
  const homeworld = character.homeworld;

  return (
    <div>
      <div className="toolbar">
        <button onClick={goHome}>← Back</button>
        <div className="spacer" />
        <button onClick={() => openEditor(character.id)}>Edit</button>
        <button onClick={doCopy}>Copy to clipboard</button>
        <button
          className="danger"
          onClick={() => {
            if (confirm(`Delete "${character.name || "(unnamed)"}"?`)) {
              deleteCharacter(character.id);
            }
          }}
        >
          Delete
        </button>
      </div>

      <CharacterSummary character={character} />

      {!isDone && (
        <div className="notice">
          This character is mid-generation: <strong>{phaseLabel(character.generation.phase, character.generation.termNumber)}</strong>.
          The wizard will be available in a future release. Editor and clipboard export still work.
        </div>
      )}

      {homeworld && (
        <div className="card">
          <h3>Homeworld</h3>
          <p>
            Starport <span className="mono">{homeworld.starport}</span>, tech{" "}
            <span className="mono">{homeworld.techLevel}</span>, size{" "}
            <span className="mono">{homeworld.size}</span>, atm{" "}
            <span className="mono">{homeworld.atmosphere}</span>, hydro{" "}
            <span className="mono">{homeworld.hydrographics}</span>, pop{" "}
            <span className="mono">{homeworld.population}</span>, law{" "}
            <span className="mono">{homeworld.lawLevel}</span>
          </p>
        </div>
      )}

      <div className="card">
        <h3>Skills</h3>
        <SkillList character={character} />
      </div>

      <div className="card">
        <h3>Possessions & wealth</h3>
        {character.cash > 0 && (
          <p>
            <strong>Cash:</strong> Cr{character.cash.toLocaleString()}
          </p>
        )}
        {character.retirementPay > 0 && (
          <p>
            <strong>Retirement:</strong> Cr{character.retirementPay.toLocaleString()}/yr
          </p>
        )}
        {(character.passages.high + character.passages.middle + character.passages.low) > 0 && (
          <p>
            <strong>Passages:</strong> {character.passages.high} High, {character.passages.middle} Middle,{" "}
            {character.passages.low} Low
          </p>
        )}
        {character.possessions.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
            {character.possessions.map((p, i) => (
              <li key={i}>{p.description}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">No possessions.</p>
        )}
      </div>

      {character.decorations.length > 0 && (
        <div className="card">
          <h3>Decorations</h3>
          <p>{character.decorations.join(", ")}</p>
        </div>
      )}

      <div className="card">
        <h3>Log</h3>
        <LogView character={character} />
      </div>
    </div>
  );
}
