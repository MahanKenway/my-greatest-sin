/** Luminous Connectome Lab: published root-ID contract stays precise in JavaScript-safe strings. */
import { describe, expect, it } from "vitest";
import { SUGAR_MN9_PILOT } from "./sugarMn9Pilot";

describe("sugar-GRN to MN9 pilot contract", () => {
  it("keeps the published root IDs as exact strings and separates modelled mappings", () => {
    expect(SUGAR_MN9_PILOT.inputRootIds).toHaveLength(21);
    expect(new Set(SUGAR_MN9_PILOT.inputRootIds).size).toBe(21);
    expect(SUGAR_MN9_PILOT.inputRootIds.every((id) => /^720575940\d{9}$/.test(id))).toBe(true);
    expect(SUGAR_MN9_PILOT.outputRootId).toBe("720575940660219265");
    expect(SUGAR_MN9_PILOT.inputMapping).toContain("MODELLED SENSOR INPUT");
    expect(SUGAR_MN9_PILOT.outputMapping).toContain("MODELLED MOTOR DECODER");
  });
});
