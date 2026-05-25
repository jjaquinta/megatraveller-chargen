/**
 * Random strategy: picks uniformly at random from available options.
 *
 * For decisions that don't have an explicit option list (identity, accept
 * draft, reenlist), uses sensible defaults: a random Human male character
 * from a default homeworld, always accepts draft, always reenlists if
 * possible.
 */

import type { Strategy } from "./types";
import type { Character, Decision, DecisionRequest } from "../engine/types";
import type { RNG } from "../engine/rng";

const DEFAULT_HOMEWORLD = {
  starport: "B",
  size: 7,
  atmosphere: 6,
  hydrographics: 5,
  population: 7,
  lawLevel: 5,
  techLevel: 12,
};

const FIRST_NAMES = ["Adam", "Beth", "Chris", "Dana", "Eli", "Fran", "Gus", "Hana"];
const LAST_NAMES = ["Anderson", "Beck", "Cao", "Davies", "Egan", "Foster"];

export class RandomStrategy implements Strategy {
  constructor(private rng: RNG) {}

  decide(request: DecisionRequest, _character: Character): Decision {
    switch (request.kind) {
      case "chooseIdentity": {
        const first = pick(FIRST_NAMES, this.rng);
        const last = pick(LAST_NAMES, this.rng);
        return {
          kind: "chooseIdentity",
          name: `${first} ${last}`,
          gender: "Unspecified",
          race: "Human",
          homeworld: DEFAULT_HOMEWORLD,
        };
      }
      case "chooseCareer": {
        if (request.options.length === 0) {
          throw new Error("No careers available to choose from");
        }
        return { kind: "chooseCareer", careerId: pick(request.options, this.rng) };
      }
      case "acceptDraft":
        return { kind: "acceptDraft", accept: true };
      case "chooseSkillTable": {
        if (request.allowed.length === 0) {
          throw new Error("No skill tables available");
        }
        return { kind: "chooseSkillTable", tableId: pick(request.allowed, this.rng) };
      }
      case "resolveCascade": {
        if (request.mayDefer && this.rng.next() < 0.5) {
          return { kind: "resolveCascade", choice: { kind: "defer" } };
        }
        if (request.options.length === 0) {
          throw new Error(`Cascade ${request.parent} has no options to resolve to`);
        }
        return {
          kind: "resolveCascade",
          choice: { kind: "specific", child: pick(request.options, this.rng) },
        };
      }
      case "anagathicsUse":
        // 30% chance to start taking anagathics; if already using, 70% chance to continue.
        return {
          kind: "anagathicsUse",
          use: request.currentlyUsing ? this.rng.next() < 0.7 : this.rng.next() < 0.3,
        };
      case "reenlist":
        return { kind: "reenlist", reenlist: this.rng.next() < 0.5 };
      case "musterOutTableChoice": {
        const canCash = request.cashRollsUsed < request.cashLimit;
        const useCash = canCash && this.rng.next() < 0.5;
        return { kind: "musterOutTableChoice", table: useCash ? "cash" : "benefits" };
      }
      case "chooseWeapon": {
        // 50/50 between new weapon and stacking one we already own (when possible).
        if (request.alreadyOwned.length > 0 && this.rng.next() < 0.5) {
          return {
            kind: "chooseWeapon",
            choice: { kind: "stack", weapon: pick(request.alreadyOwned, this.rng) },
          };
        }
        return {
          kind: "chooseWeapon",
          choice: { kind: "new", weapon: pick(request.availableWeapons, this.rng) },
        };
      }
      case "agingSavedCharacteristics":
        // Pick the first `count` options.
        return {
          kind: "agingSavedCharacteristics",
          chosen: request.options.slice(0, request.count),
        };
    }
  }
}

function pick<T>(arr: readonly T[], rng: RNG): T {
  const i = Math.floor(rng.next() * arr.length);
  return arr[i] as T;
}
