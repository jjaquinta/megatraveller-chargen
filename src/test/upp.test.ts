import { describe, it, expect } from "vitest";
import { encodeUPP, decodeUPP, encodeChar, decodeChar, clampChar, applyDelta } from "../engine/upp";

describe("UPP encoding", () => {
  it("encodes digits 0-9 as themselves", () => {
    expect(encodeChar(7)).toBe("7");
    expect(encodeChar(0)).toBe("0");
    expect(encodeChar(9)).toBe("9");
  });

  it("encodes 10-15 as A-F", () => {
    expect(encodeChar(10)).toBe("A");
    expect(encodeChar(11)).toBe("B");
    expect(encodeChar(15)).toBe("F");
  });

  it("round-trips through hex", () => {
    for (let i = 0; i <= 15; i++) {
      expect(decodeChar(encodeChar(i))).toBe(i);
    }
  });

  it("encodes a full UPP", () => {
    const upp = { Str: 7, Dex: 8, End: 9, Int: 10, Edu: 11, Soc: 12 };
    expect(encodeUPP(upp)).toBe("789ABC");
  });

  it("decodes a full UPP", () => {
    expect(decodeUPP("777777")).toEqual({ Str: 7, Dex: 7, End: 7, Int: 7, Edu: 7, Soc: 7 });
    expect(decodeUPP("AABBCC")).toEqual({ Str: 10, Dex: 10, End: 11, Int: 11, Edu: 12, Soc: 12 });
  });

  it("clamps to 0-15", () => {
    expect(clampChar(-1)).toBe(0);
    expect(clampChar(16)).toBe(15);
    expect(clampChar(7)).toBe(7);
  });

  it("applies a delta with clamping", () => {
    const upp = { Str: 7, Dex: 7, End: 7, Int: 7, Edu: 7, Soc: 7 };
    expect(applyDelta(upp, "Str", 1).Str).toBe(8);
    expect(applyDelta(upp, "Str", 100).Str).toBe(15);
    expect(applyDelta(upp, "Str", -100).Str).toBe(0);
  });
});
