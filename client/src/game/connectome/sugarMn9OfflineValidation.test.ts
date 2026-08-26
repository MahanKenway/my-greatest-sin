import { describe, expect, it } from "vitest";
import { SUGAR_MN9_OFFLINE_VALIDATION } from "./sugarMn9OfflineValidation";

describe("offline sugar-MN9 validation record", () => {
  it("is explicitly bounded and does not present a fabricated MN9 response", () => {
    expect(SUGAR_MN9_OFFLINE_VALIDATION.status).toBe("OFFLINE SUBGRAPH VALIDATION");
    expect(SUGAR_MN9_OFFLINE_VALIDATION.baselineMn9RatesHz).toEqual([0, 0, 0, 0, 0, 0]);
    expect(SUGAR_MN9_OFFLINE_VALIDATION.ablatedMn9RatesHz).toEqual([0, 0, 0, 0, 0, 0]);
  });
});
