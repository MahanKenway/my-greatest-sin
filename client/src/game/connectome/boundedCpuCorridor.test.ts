import { describe, expect, it } from "vitest";
import { runBoundedCpuStructuralPropagation, validateBoundedCpuCorridorPack } from "./boundedCpuCorridor";

const pack = validateBoundedCpuCorridorPack({
  schema: "my-greatest-sin.cpu-corridor.v1", status: "CPU OFFLINE SUBGRAPH VALIDATION ONLY", sourceStatus: "SOURCE DATA", modelledInput: "MODELLED SENSOR INPUT", modelledDynamics: "SIGNED STRUCTURAL PROPAGATION — NOT LIF",
  limits: { maxNodes: 2000, maxEdges: 25000 }, nodeCount: 2, edgeCount: 1, inputIndices: [0], mn9Index: 1, mn9RootId: "720575940660219265",
  sourceIndices: [0], targetIndices: [1], signedSynapseCounts: [100], provenance: {}, boundary: "No GameWorld or body output.",
});

describe("bounded CPU corridor", () => {
  it("propagates a bounded signed structural score and honours input ablation", () => {
    expect(runBoundedCpuStructuralPropagation(pack, { foodIntensity: 1, protocol: { activationRateHz: 200, inputAblation: "OPEN" } }).mn9StructuralScore).toBeGreaterThan(0);
    expect(runBoundedCpuStructuralPropagation(pack, { foodIntensity: 1, protocol: { activationRateHz: 200, inputAblation: "CLOSED" } }).mn9StructuralScore).toBe(0);
  });

  it("rejects any pack outside the CPU safety cap", () => {
    expect(() => validateBoundedCpuCorridorPack({ ...pack, nodeCount: 2001 })).toThrow(/forbidden/i);
  });

  it("honours cancellation before any structural propagation begins", () => {
    const controller = new AbortController();
    controller.abort();
    expect(() => runBoundedCpuStructuralPropagation(pack, { foodIntensity: 1, protocol: { activationRateHz: 200, inputAblation: "OPEN" }, signal: controller.signal })).toThrow(/cancelled/i);
  });
});
