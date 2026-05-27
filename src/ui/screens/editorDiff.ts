/**
 * Editor draft-vs-original diff logic, extracted so it can be unit-tested.
 *
 * Pure functions. No React.
 */

import type {
  Character,
  CharacteristicName,
  ManualEdit,
  Possession,
  SkillId,
} from "../../engine/types";
import { CHARACTERISTIC_ORDER } from "../../engine/types";

export interface Draft {
  name: string;
  gender: string;
  race: string;
  age: number;
  upp: Record<CharacteristicName, number>;
  skills: Array<[SkillId, number]>;
  cash: number;
  retirementPay: number;
  possessions: Possession[];
  decorations: string[];
}

export function toDraft(c: Character): Draft {
  return {
    name: c.name,
    gender: c.gender,
    race: c.race,
    age: c.age,
    upp: { ...c.upp },
    skills: Array.from(c.skills.entries()).sort((a, b) => a[0].localeCompare(b[0])),
    cash: c.cash,
    retirementPay: c.retirementPay,
    possessions: c.possessions.map((p) => ({ ...p })),
    decorations: [...c.decorations],
  };
}

export function commitDraft(
  original: Character,
  draft: Draft,
): { character: Character; edits: ManualEdit[] } {
  const edits: ManualEdit[] = [];

  if (draft.name !== original.name) edits.push({ kind: "setName", name: draft.name });
  if (draft.age !== original.age) edits.push({ kind: "setAge", age: draft.age });
  if (draft.cash !== original.cash) edits.push({ kind: "setCash", cash: draft.cash });
  if (draft.retirementPay !== original.retirementPay) {
    edits.push({ kind: "setRetirementPay", perYear: draft.retirementPay });
  }
  for (const stat of CHARACTERISTIC_ORDER) {
    if (draft.upp[stat] !== original.upp[stat]) {
      edits.push({ kind: "setUPP", stat, value: draft.upp[stat] });
    }
  }
  const origSkills = new Map(original.skills);
  const draftSkills = new Map(draft.skills);
  for (const [k, v] of draftSkills) {
    if (origSkills.get(k) !== v) {
      edits.push({ kind: "setSkill", skillId: k, level: v });
    }
  }
  for (const k of origSkills.keys()) {
    if (!draftSkills.has(k)) {
      edits.push({ kind: "setSkill", skillId: k, level: 0 });
    }
  }

  const possKey = (p: Possession): string => `${p.description}|${p.objectId ?? ""}`;
  const origKeys = original.possessions.map(possKey);
  const draftKeys = draft.possessions.map(possKey);
  original.possessions.forEach((p, i) => {
    if (!draftKeys.includes(possKey(p))) {
      edits.push({ kind: "removePossession", index: i });
    }
  });
  draft.possessions.forEach((p) => {
    if (!origKeys.includes(possKey(p))) {
      edits.push({ kind: "addPossession", possession: p });
    }
  });

  const character: Character = {
    ...original,
    name: draft.name,
    gender: draft.gender,
    race: draft.race,
    age: draft.age,
    upp: { ...draft.upp },
    skills: new Map(draftSkills),
    cash: draft.cash,
    retirementPay: draft.retirementPay,
    possessions: draft.possessions.map((p) => ({ ...p })),
    decorations: [...draft.decorations],
    edits: [...original.edits, ...edits],
  };
  return { character, edits };
}
