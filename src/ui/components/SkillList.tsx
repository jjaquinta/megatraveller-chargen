import type { JSX } from "react";
import type { Character } from "../../engine/types";

export function SkillList({ character }: { character: Character }): JSX.Element {
  const skills = Array.from(character.skills.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );
  if (skills.length === 0) {
    return <p className="muted">No skills.</p>;
  }
  return (
    <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
      {skills.map(([id, level]) => (
        <li key={id}>
          <span className="mono">{id}</span>-{level}
        </li>
      ))}
    </ul>
  );
}
