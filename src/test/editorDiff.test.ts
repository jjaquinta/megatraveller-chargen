import { describe, it, expect } from "vitest";
import { toDraft, commitDraft } from "../ui/screens/editorDiff";
import { newCharacter } from "../engine/advance";

describe("editor diff", () => {
  function baseline() {
    const c = newCharacter("ed-1");
    c.name = "Alice";
    c.age = 22;
    c.cash = 1000;
    c.upp = { Str: 7, Dex: 7, End: 7, Int: 7, Edu: 7, Soc: 7 };
    c.skills = new Map([["Pilot", 1]]);
    c.possessions = [{ description: "Knife" }];
    return c;
  }

  it("no changes produces no edits", () => {
    const c = baseline();
    const d = toDraft(c);
    const { character, edits } = commitDraft(c, d);
    expect(edits).toHaveLength(0);
    expect(character.edits).toEqual(c.edits);
  });

  it("name change is recorded", () => {
    const c = baseline();
    const d = toDraft(c);
    d.name = "Bob";
    const { character, edits } = commitDraft(c, d);
    expect(edits).toContainEqual({ kind: "setName", name: "Bob" });
    expect(character.name).toBe("Bob");
  });

  it("UPP change is recorded per-stat", () => {
    const c = baseline();
    const d = toDraft(c);
    d.upp.Str = 10;
    d.upp.Dex = 8;
    const { character, edits } = commitDraft(c, d);
    expect(edits).toContainEqual({ kind: "setUPP", stat: "Str", value: 10 });
    expect(edits).toContainEqual({ kind: "setUPP", stat: "Dex", value: 8 });
    expect(edits).toHaveLength(2);
    expect(character.upp.Str).toBe(10);
    expect(character.upp.End).toBe(7); // unchanged
  });

  it("skill level change is recorded", () => {
    const c = baseline();
    const d = toDraft(c);
    d.skills = d.skills.map(([k, v]) => (k === "Pilot" ? [k, 3] : [k, v]));
    const { character, edits } = commitDraft(c, d);
    expect(edits).toContainEqual({ kind: "setSkill", skillId: "Pilot", level: 3 });
    expect(character.skills.get("Pilot")).toBe(3);
  });

  it("skill removal is recorded as level 0", () => {
    const c = baseline();
    const d = toDraft(c);
    d.skills = [];
    const { character, edits } = commitDraft(c, d);
    expect(edits).toContainEqual({ kind: "setSkill", skillId: "Pilot", level: 0 });
    expect(character.skills.has("Pilot")).toBe(false);
  });

  it("skill addition is recorded", () => {
    const c = baseline();
    const d = toDraft(c);
    d.skills = [...d.skills, ["Tactics", 2]];
    const { character, edits } = commitDraft(c, d);
    expect(edits).toContainEqual({ kind: "setSkill", skillId: "Tactics", level: 2 });
    expect(character.skills.get("Tactics")).toBe(2);
  });

  it("possession addition is recorded", () => {
    const c = baseline();
    const d = toDraft(c);
    d.possessions = [...d.possessions, { description: "Vacc suit" }];
    const { character, edits } = commitDraft(c, d);
    expect(edits).toContainEqual({ kind: "addPossession", possession: { description: "Vacc suit" } });
    expect(character.possessions.length).toBe(2);
  });

  it("possession removal is recorded", () => {
    const c = baseline();
    const d = toDraft(c);
    d.possessions = [];
    const { character, edits } = commitDraft(c, d);
    expect(edits).toContainEqual({ kind: "removePossession", index: 0 });
    expect(character.possessions).toHaveLength(0);
  });

  it("cash and retirement pay changes are recorded", () => {
    const c = baseline();
    const d = toDraft(c);
    d.cash = 5000;
    d.retirementPay = 12000;
    const { character, edits } = commitDraft(c, d);
    expect(edits).toContainEqual({ kind: "setCash", cash: 5000 });
    expect(edits).toContainEqual({ kind: "setRetirementPay", perYear: 12000 });
    expect(character.cash).toBe(5000);
    expect(character.retirementPay).toBe(12000);
  });

  it("edits accumulate across commits", () => {
    const c = baseline();
    const d1 = toDraft(c);
    d1.name = "Bob";
    const { character: c1 } = commitDraft(c, d1);
    expect(c1.edits).toHaveLength(1);

    const d2 = toDraft(c1);
    d2.age = 30;
    const { character: c2 } = commitDraft(c1, d2);
    expect(c2.edits).toHaveLength(2);
    expect(c2.edits[0]).toEqual({ kind: "setName", name: "Bob" });
    expect(c2.edits[1]).toEqual({ kind: "setAge", age: 30 });
  });

  it("the log is untouched by edits", () => {
    const c = baseline();
    c.log = [{ term: 0, text: "initial log entry" }];
    const d = toDraft(c);
    d.name = "Different";
    const { character } = commitDraft(c, d);
    expect(character.log).toEqual(c.log);
  });
});
