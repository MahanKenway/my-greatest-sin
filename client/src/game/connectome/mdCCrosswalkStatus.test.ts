import { describe, expect, it } from "vitest";
import { MD_C_CROSSWALK_STATUS } from "./mdCCrosswalkStatus";

describe("md-C crosswalk gate", () => {
  it("keeps md-C execution blocked and preserves its correct swallow targets", () => {
    expect(MD_C_CROSSWALK_STATUS.executionAllowed).toBe(false);
    expect(MD_C_CROSSWALK_STATUS.correctTargets).toEqual(["MN11", "MN12"]);
    expect(MD_C_CROSSWALK_STATUS.forbiddenSubstitutions).toContain("MN9");
    expect(MD_C_CROSSWALK_STATUS.materialization).toContain("783");
  });
});
