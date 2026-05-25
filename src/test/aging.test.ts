import { describe, it, expect } from "vitest";
import { agingEffectsFor } from "../engine/rules/ageEffects";

describe("Aging Table", () => {
  it("returns null below 34", () => {
    expect(agingEffectsFor(18)).toBeNull();
    expect(agingEffectsFor(33)).toBeNull();
  });

  it("returns the 34 row for apparent age 34..37", () => {
    const e34 = agingEffectsFor(34);
    const e37 = agingEffectsFor(37);
    expect(e34?.length).toBe(3);
    expect(e34?.find((e) => e.stat === "Str")?.savingThrow).toBe(8);
    expect(e34?.find((e) => e.stat === "Dex")?.savingThrow).toBe(7);
    expect(e37).toEqual(e34);
  });

  it("returns the 50 row at apparent age 50", () => {
    const e = agingEffectsFor(50);
    expect(e?.find((x) => x.stat === "Str")?.savingThrow).toBe(9);
    expect(e?.find((x) => x.stat === "Dex")?.savingThrow).toBe(8);
  });

  it("returns the 66+ row at high ages with 4 effects", () => {
    const e66 = agingEffectsFor(66);
    const e100 = agingEffectsFor(100);
    expect(e66?.length).toBe(4);
    expect(e66?.find((x) => x.stat === "Int")?.loss).toBe(1);
    expect(e66?.find((x) => x.stat === "Str")?.loss).toBe(2);
    expect(e100).toEqual(e66);
  });
});
