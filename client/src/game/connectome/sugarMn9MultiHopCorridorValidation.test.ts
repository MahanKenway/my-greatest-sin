import { describe, expect, it } from "vitest";
import { SUGAR_MN9_MULTIHOP_CORRIDOR_VALIDATION } from "./sugarMn9MultiHopCorridorValidation";

describe("multi-hop corridor validation record", () => {
  it("keeps a source-derived response separate from ablation and body control", () => {
    expect(SUGAR_MN9_MULTIHOP_CORRIDOR_VALIDATION.nodeCount).toBe(1115);
    expect(SUGAR_MN9_MULTIHOP_CORRIDOR_VALIDATION.baselineMn9RatesHz.at(-1)).toBeGreaterThan(0);
    expect(SUGAR_MN9_MULTIHOP_CORRIDOR_VALIDATION.ablatedMn9RatesHz.every((rate) => rate === 0)).toBe(true);
    expect(SUGAR_MN9_MULTIHOP_CORRIDOR_VALIDATION.boundary).toMatch(/not full FlyWire/i);
  });
});
