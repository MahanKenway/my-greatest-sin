/** Luminous Connectome Lab: source topology is asserted separately from modelled runtime mappings. */
import { describe, expect, it } from "vitest";
import { buildCElegansRuntime } from "./celegansRuntime";
import type { ConnectomeManifest } from "@/game/shared/types";

const manifest = {
  format: "DFLY",
  formatVersion: 1,
  datasetId: "test-celegans",
  release: "test",
  origin: "https://example.test/source.xlsx",
  license: "MIT",
  neuronCount: 4,
  synapseCount: 3,
  dictionaries: { cellNames: ["ASEL", "AVAL", "VB1", "VD1"] },
  chunks: [],
} as ConnectomeManifest;

describe("C. elegans runtime hydration", () => {
  it("converts verified source columns into compact incoming CSR and modelled routing", () => {
    const runtime = buildCElegansRuntime(manifest, {
      cell_index: new Uint32Array([0, 1, 2, 3]).buffer,
      incoming_offsets: new Uint32Array([0, 0, 1, 2, 3]).buffer,
      source_index: new Uint32Array([0, 1, 1]).buffer,
      connection_weight: new Float32Array([2, 4, 1]).buffer,
      connection_kind: new Uint16Array([0, 1, 0]).buffer,
    });
    expect(runtime.columns.provenance).toBe("SOURCE DATA");
    expect(runtime.columns.incomingOffsets.at(-1)).toBe(3);
    expect(runtime.columns.incomingWeights[1]).toBeCloseTo(0.1, 5);
    expect(runtime.routing.sensory.food).toEqual([0]);
    expect(runtime.routing.motor.reactive).toEqual([1]);
    expect(runtime.routing.motor.forward).toEqual([2]);
    expect(runtime.routing.motor.right).toEqual([3]);
    expect(runtime.execution.topology).toBe("SOURCE DATA");
  });
});
