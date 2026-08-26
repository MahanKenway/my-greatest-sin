import { describe, expect, it } from "vitest";
import { assertLifSignManifestReady, classifyNeuronSign, signedSynapticWeightMilliVolts } from "./flywireLifKernel";

describe("FlyWire LIF sign contract", () => {
  it("uses the strict-majority inhibitory rule and preserves ties as excitatory", () => {
    expect(classifyNeuronSign(0, 0)).toBe(0);
    expect(classifyNeuronSign(10, 5)).toBe(1);
    expect(classifyNeuronSign(10, 6)).toBe(-1);
  });

  it("computes source-signed connectivity weights only for classified neurons", () => {
    expect(signedSynapticWeightMilliVolts(4, 1)).toBeCloseTo(1.1);
    expect(signedSynapticWeightMilliVolts(4, -1)).toBeCloseTo(-1.1);
    expect(() => signedSynapticWeightMilliVolts(4, 0)).toThrow(/unclassified/i);
  });

  it("blocks an incomplete sign artifact", () => {
    const source = { format: "DFLY-NEURON-SIGN", release: "783", neuronCount: 139255, counts: { excitatory: 100000, inhibitory: 39000, unclassified: 255 }, classificationRule: { cleftScoreCutoff: 50, inhibitoryCondition: "strictly more than half of qualifying presynaptic sites" } };
    expect(() => assertLifSignManifestReady(source, 139255)).toThrow(/blocked/i);
  });
});
