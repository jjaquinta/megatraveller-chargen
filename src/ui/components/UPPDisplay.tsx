import type { JSX } from "react";
import type { UPP } from "../../engine/types";
import { encodeUPP } from "../../engine/upp";

export function UPPDisplay({ upp }: { upp: UPP }): JSX.Element {
  return <span className="upp-display">{encodeUPP(upp)}</span>;
}
