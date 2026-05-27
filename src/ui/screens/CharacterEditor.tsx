/**
 * Free-form character editor.
 *
 * Opens with a draft copy of the character; the user edits via local state
 * and clicks Save to commit, or Discard to revert.
 *
 * Each commit appends ManualEdit records describing what changed, so the
 * editor's edits remain distinguishable from generation output. The log
 * itself is not editable; the editor only writes to character fields.
 */

import { useEffect, useMemo, useState, type JSX } from "react";
import { useApp } from "../state/AppState";
import type {
  CharacteristicName,
  SkillId,
} from "../../engine/types";
import { CHARACTERISTIC_ORDER } from "../../engine/types";
import { encodeUPP, clampChar } from "../../engine/upp";
import { LogView } from "../components/LogView";
import { commitDraft, toDraft, type Draft } from "./editorDiff";

export function CharacterEditor({ id }: { id: string }): JSX.Element {
  const { store, saveCharacter, goHome, setError } = useApp();
  const original = useMemo(() => store.get(id), [id, store]);
  const [draft, setDraft] = useState<Draft | null>(() => (original ? toDraft(original) : null));

  useEffect(() => {
    setDraft(original ? toDraft(original) : null);
  }, [original]);

  // Beforeunload warning when dirty.
  const isDirty = useMemo(() => {
    if (!original || !draft) return false;
    return JSON.stringify(toDraft(original)) !== JSON.stringify(draft);
  }, [original, draft]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent): void => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  if (!original || !draft) {
    return (
      <div>
        <div className="toolbar">
          <button onClick={goHome}>← Back</button>
        </div>
        <div className="error">Character {id} not found.</div>
      </div>
    );
  }

  function update<K extends keyof Draft>(key: K, value: Draft[K]): void {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  function setUPP(stat: CharacteristicName, raw: string): void {
    const n = clampChar(parseInt(raw, 10) || 0);
    setDraft((d) => (d ? { ...d, upp: { ...d.upp, [stat]: n } } : d));
  }

  function setSkillLevel(skillId: SkillId, raw: string): void {
    const n = Math.max(0, parseInt(raw, 10) || 0);
    setDraft((d) => {
      if (!d) return d;
      const next = d.skills.map(([k, v]) => (k === skillId ? [k, n] as [SkillId, number] : [k, v] as [SkillId, number]));
      return { ...d, skills: next };
    });
  }

  function removeSkill(skillId: SkillId): void {
    setDraft((d) => (d ? { ...d, skills: d.skills.filter(([k]) => k !== skillId) } : d));
  }

  function addSkill(): void {
    const id = window.prompt("New skill id (e.g. Pilot, Tactics, AutoPistol):")?.trim();
    if (!id) return;
    const levelRaw = window.prompt("Level (integer >= 0):", "1")?.trim() ?? "1";
    const level = Math.max(0, parseInt(levelRaw, 10) || 0);
    setDraft((d) => {
      if (!d) return d;
      if (d.skills.some(([k]) => k === id)) {
        setError(`Skill "${id}" already present; edit its level instead.`);
        return d;
      }
      return {
        ...d,
        skills: [...d.skills, [id, level] as [SkillId, number]].sort((a, b) =>
          a[0].localeCompare(b[0]),
        ),
      };
    });
  }

  function addPossession(): void {
    const desc = window.prompt("Possession description:")?.trim();
    if (!desc) return;
    setDraft((d) => (d ? { ...d, possessions: [...d.possessions, { description: desc }] } : d));
  }

  function removePossession(idx: number): void {
    setDraft((d) => (d ? { ...d, possessions: d.possessions.filter((_, i) => i !== idx) } : d));
  }

  function setDecorations(raw: string): void {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    update("decorations", parts);
  }

  function doSave(): void {
    if (!original || !draft) return;
    const { character } = commitDraft(original, draft);
    saveCharacter(character);
    goHome();
  }

  function doDiscard(): void {
    if (isDirty && !confirm("Discard your changes?")) return;
    if (original) setDraft(toDraft(original));
    goHome();
  }

  return (
    <div>
      <div className="toolbar">
        <button onClick={doDiscard}>← Back / Discard</button>
        <div className="spacer" />
        {isDirty && <span className="muted">Unsaved changes</span>}
        <button onClick={doDiscard}>Discard</button>
        <button className="primary" disabled={!isDirty} onClick={doSave}>
          Save
        </button>
      </div>

      <div className="card">
        <h3>Identity</h3>
        <div className="row">
          <div style={{ flex: "1 1 220px" }}>
            <label className="muted" style={{ fontSize: "0.85em" }}>
              Name
            </label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <label className="muted" style={{ fontSize: "0.85em" }}>
              Gender
            </label>
            <input
              type="text"
              value={draft.gender}
              onChange={(e) => update("gender", e.target.value)}
            />
          </div>
          <div style={{ flex: "1 1 120px" }}>
            <label className="muted" style={{ fontSize: "0.85em" }}>
              Age
            </label>
            <input
              type="number"
              min={0}
              value={draft.age}
              onChange={(e) => update("age", parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3>UPP</h3>
        <div className="upp-display">{encodeUPP(draft.upp)}</div>
        <div className="upp-grid">
          {CHARACTERISTIC_ORDER.map((stat) => (
            <div className="upp-cell" key={stat}>
              <label>{stat}</label>
              <input
                type="number"
                min={0}
                max={15}
                value={draft.upp[stat]}
                onChange={(e) => setUPP(stat, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Skills</h3>
        {draft.skills.length === 0 && <p className="muted">No skills.</p>}
        {draft.skills.map(([id, level]) => (
          <div key={id} className="skill-row">
            <span className="mono">{id}</span>
            <input
              type="number"
              min={0}
              value={level}
              onChange={(e) => setSkillLevel(id, e.target.value)}
            />
            <button className="danger" onClick={() => removeSkill(id)}>
              Remove
            </button>
          </div>
        ))}
        <button onClick={addSkill} style={{ marginTop: "0.4rem" }}>
          + Add skill
        </button>
      </div>

      <div className="card">
        <h3>Wealth</h3>
        <div className="row">
          <div style={{ flex: "1 1 200px" }}>
            <label className="muted" style={{ fontSize: "0.85em" }}>
              Cash (Cr)
            </label>
            <input
              type="number"
              min={0}
              value={draft.cash}
              onChange={(e) => update("cash", parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label className="muted" style={{ fontSize: "0.85em" }}>
              Retirement pay (Cr/yr)
            </label>
            <input
              type="number"
              min={0}
              value={draft.retirementPay}
              onChange={(e) => update("retirementPay", parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Possessions</h3>
        {draft.possessions.length === 0 && <p className="muted">No possessions.</p>}
        {draft.possessions.map((p, i) => (
          <div key={i} className="possession-row">
            <span>{p.description}</span>
            <span className="muted mono">{p.objectId ?? ""}</span>
            <button className="danger" onClick={() => removePossession(i)}>
              Remove
            </button>
          </div>
        ))}
        <button onClick={addPossession} style={{ marginTop: "0.4rem" }}>
          + Add possession
        </button>
      </div>

      <div className="card">
        <h3>Decorations</h3>
        <label className="muted" style={{ fontSize: "0.85em" }}>
          Comma-separated list (e.g. &ldquo;MCUF, SEH, Purple Heart&rdquo;)
        </label>
        <input
          type="text"
          value={draft.decorations.join(", ")}
          onChange={(e) => setDecorations(e.target.value)}
        />
      </div>

      <div className="card">
        <h3>Log (read-only)</h3>
        <LogView character={original} />
      </div>

      {/* Bottom save bar duplicates the toolbar for convenience on long pages. */}
      <div className="toolbar" style={{ position: "sticky", bottom: 0, background: "var(--bg)", padding: "0.5rem 0" }}>
        <div className="spacer" />
        {isDirty && <span className="muted">Unsaved changes</span>}
        <button onClick={doDiscard}>Discard</button>
        <button className="primary" disabled={!isDirty} onClick={doSave}>
          Save
        </button>
      </div>
    </div>
  );
}
