import { describe, expect, it } from "vitest";
import { estimateFlywirePilotBudget } from "./flywireAdapterCapability";
import type { ConnectomeManifest } from "@/game/shared/types";

const manifest: ConnectomeManifest = {
  format: "DFLY", formatVersion: 1, datasetId: "test", release: "783", origin: "test", license: "CC BY 4.0", neuronCount: 10, synapseCount: 12,
  columns: {
    incoming_offsets: { scalarType: "u32", elementCount: 11, stride: 4, semanticStatus: "SOURCE DATA", chunks: ["offsets"] },
    source_index: { scalarType: "u32", elementCount: 12, stride: 4, semanticStatus: "SOURCE DATA", chunks: ["source-a", "source-b"] },
    synapse_count: { scalarType: "u32", elementCount: 12, stride: 4, semanticStatus: "SOURCE DATA", chunks: ["synapses"] },
  },
  chunks: [
    { id: "offsets", bytes: 44, sha256: "a" }, { id: "source-a", bytes: 32, sha256: "b" }, { id: "source-b", bytes: 16, sha256: "c" }, { id: "synapses", bytes: 48, sha256: "d" },
  ],
};

describe("estimateFlywirePilotBudget", () => {
  it("counts only required source columns and the three modelled f32 state buffers", () => {
    const budget = estimateFlywirePilotBudget(manifest);
    expect(budget.requiredColumnBytes).toEqual({ incoming_offsets: 44, source_index: 48, synapse_count: 48 });
    expect(budget.largestStorageBufferBytes).toBe(48);
    expect(budget.residentGpuBytes).toBe(44 + 48 + 48 + 10 * 4 * 3 + 64);
  });
});
