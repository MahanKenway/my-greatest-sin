import { describe, expect, it } from "vitest";
import { assessSiteLevelSignReadiness, DEFAULT_FLYWIRE_LIF_SETTINGS, validateFlywireLifSettings } from "./flywireSiteLevelLif";

const completeManifest = {
  format: "DFLY-NEURON-SIGN", release: "783", neuronCount: 4,
  counts: { excitatory: 3, inhibitory: 1, unclassified: 0 },
  classificationRule: { cleftScoreCutoff: 50, inhibitoryCondition: "strictly more than half of qualifying presynaptic sites" },
};

describe("FlyWire site-level LIF readiness", () => {
  it("blocks a checksum-derived sign summary with unresolved neurons before device work", () => {
    const blocked = assessSiteLevelSignReadiness({ ...completeManifest, counts: { excitatory: 3, inhibitory: 0, unclassified: 1 } }, 4);
    expect(blocked).toMatchObject({ state: "BLOCKED", stage: "SIGN" });
  });

  it("accepts only sign-complete v783 summaries and bounded settings", () => {
    expect(assessSiteLevelSignReadiness(completeManifest, 4).state).toBe("READY");
    expect(validateFlywireLifSettings(DEFAULT_FLYWIRE_LIF_SETTINGS)).toEqual(DEFAULT_FLYWIRE_LIF_SETTINGS);
    expect(() => validateFlywireLifSettings({ ...DEFAULT_FLYWIRE_LIF_SETTINGS, synapticWeightMilliVolts: 4 })).toThrow();
  });
});
