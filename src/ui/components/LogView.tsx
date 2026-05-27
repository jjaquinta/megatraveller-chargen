import type { JSX } from "react";
import type { Character } from "../../engine/types";

export function LogView({ character }: { character: Character }): JSX.Element {
  if (character.log.length === 0) {
    return <p className="muted">No log entries.</p>;
  }
  return (
    <div className="log">
      {character.log.map((entry, i) => (
        <div key={i} className="log-entry">
          <span className="term-label">[t{entry.term}]</span>
          {entry.text}
        </div>
      ))}
    </div>
  );
}
