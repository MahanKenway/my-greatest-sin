import { describe, expect, it } from "vitest";
import { normalizeSugarMn9PilotProtocol } from "./sugarMn9PilotRuntime";

describe("normalizeSugarMn9PilotProtocol", () => {
  it("keeps the modelled sugar-input protocol bounded and makes negative control explicit", () => {
    expect(normalizeSugarMn9PilotProtocol()).toEqual({ activationRateHz: 150, inputAblation: "OPEN" });
    expect(normalizeSugarMn9PilotProtocol({ activationRateHz: 250, inputAblation: "CLOSED" })).toEqual({ activationRateHz: 200, inputAblation: "CLOSED" });
    expect(normalizeSugarMn9PilotProtocol({ activationRateHz: -20 })).toEqual({ activationRateHz: 0, inputAblation: "OPEN" });
    expect(normalizeSugarMn9PilotProtocol({ activationRateHz: Number.NaN })).toEqual({ activationRateHz: 150, inputAblation: "OPEN" });
  });
});
