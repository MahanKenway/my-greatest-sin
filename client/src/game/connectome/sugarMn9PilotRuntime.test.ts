import { describe, expect, it } from "vitest";
import { decodeMn9StructuralScoreForProboscis } from "./sugarMn9PilotRuntime";

describe("decodeMn9StructuralScoreForProboscis", () => {
  it("keeps the explicitly modelled mouthpart channel finite, bounded, and monotonic", () => {
    expect(decodeMn9StructuralScoreForProboscis(-0.2)).toBe(0);
    expect(decodeMn9StructuralScoreForProboscis(Number.NaN)).toBe(0);
    expect(decodeMn9StructuralScoreForProboscis(0)).toBe(0);
    expect(decodeMn9StructuralScoreForProboscis(0.0025)).toBe(0.5);
    expect(decodeMn9StructuralScoreForProboscis(0.01)).toBeGreaterThan(0.5);
    expect(decodeMn9StructuralScoreForProboscis(1)).toBeLessThan(1);
  });
});
