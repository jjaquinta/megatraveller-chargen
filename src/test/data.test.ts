import { describe, it, expect } from "vitest";
import { validateData, CAREER_REGISTRY, getCareer } from "../data";
import { SKILL_REGISTRY } from "../data/skills";

describe("data validation", () => {
  it("validates without throwing", () => {
    expect(() => validateData()).not.toThrow();
  });

  it("has the Scout career", () => {
    expect(CAREER_REGISTRY.has("Scouts")).toBe(true);
    const scout = getCareer("Scouts");
    expect(scout.name).toBe("Scouts");
    expect(scout.thresholds.commission).toBeNull();
    expect(scout.skillsPerSubsequentTerm).toBe(2);
  });

  it("has the expected skills", () => {
    expect(SKILL_REGISTRY.has("Pilot")).toBe(true);
    expect(SKILL_REGISTRY.has("VaccSuit")).toBe(true);
    expect(SKILL_REGISTRY.has("GunCombat")).toBe(true);
    expect(SKILL_REGISTRY.get("GunCombat")?.isCascade).toBe(true);
  });
});
