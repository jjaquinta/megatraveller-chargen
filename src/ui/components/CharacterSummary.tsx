import type { JSX } from "react";
import type { Character } from "../../engine/types";
import { UPPDisplay } from "./UPPDisplay";
import { rankName } from "../../engine/derive";
import { getCareer } from "../../data";

/**
 * Identity strip at the top of the sheet/editor: name, UPP, career, rank,
 * age, terms.
 */
export function CharacterSummary({ character }: { character: Character }): JSX.Element {
  const career = character.career ? getCareer(character.career) : null;
  const rn = rankName(character);
  return (
    <div className="card">
      <h2 style={{ margin: 0 }}>
        {character.name || <span className="muted">(unnamed)</span>}
      </h2>
      <div className="row" style={{ gap: "1rem", marginTop: "0.4rem" }}>
        <span>
          UPP <UPPDisplay upp={character.upp} />
        </span>
        <span>
          {character.race}
          {character.gender ? `, ${character.gender}` : ""}
        </span>
        <span>Age {character.age}</span>
        <span>
          {character.terms} term{character.terms === 1 ? "" : "s"}
        </span>
        {career && (
          <span>
            {career.name}
            {rn ? ` — ${rn}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}
