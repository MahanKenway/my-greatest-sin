import { describe, expect, it } from "vitest";
import { SUGAR_MN9_EXPERIMENT_CONDITIONS, SUGAR_MN9_RESPONSE_RATES_HZ } from "./sugarMn9ExperimentProtocol";

describe("sugar-MN9 experimental contract", () => {
  it("keeps the declared response sweep and negative control deterministic", () => {
    expect(SUGAR_MN9_RESPONSE_RATES_HZ).toEqual([0, 25, 50, 100, 150, 200]);
    expect(SUGAR_MN9_EXPERIMENT_CONDITIONS.map((condition) => [condition.id, condition.inputAblation])).toEqual([
      ["baseline", "OPEN"], ["input-ablation", "CLOSED"],
    ]);
  });
});
