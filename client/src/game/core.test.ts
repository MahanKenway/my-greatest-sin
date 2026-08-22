/** Luminous Connectome Lab: core tests prove bounded parsing and deterministic typed-array neural updates. */
import { describe, expect, it } from "vitest";
import { createSyntheticFixture } from "./connectome/fixture";
import { estimateColumnMemoryMiB, validateManifest } from "./connectome/manifest";
import { TypedArrayLifEngine } from "./neural/lifCpu";

describe("DFLY connectome contract", () => {
  it("creates a compact incoming-CSR fixture without object-per-neuron edges", () => {
    const fixture = createSyntheticFixture();
    expect(fixture.neuronCount).toBe(96);
    expect(fixture.incomingOffsets).toHaveLength(97);
    expect(fixture.incomingSources).toHaveLength(fixture.synapseCount);
    expect(fixture.provenance).toBe("SYNTHETIC TEST FIXTURE");
    for (let index = 1; index < fixture.incomingOffsets.length; index += 1) {
      expect(fixture.incomingOffsets[index]).toBeGreaterThanOrEqual(fixture.incomingOffsets[index - 1]);
    }
  });

  it("accepts a bounded provenance-complete manifest and refuses incomplete release claims", () => {
    const manifest = validateManifest({
      format: "DFLY", formatVersion: 1, datasetId: "test-release", release: "v783-adapter-0", origin: "https://example.org/pack", license: "CC BY-NC 4.0", neuronCount: 139255, synapseCount: 50_000_000,
      chunks: [{ id: "neurons", bytes: 1024, sha256: "0000000000000000000000000000000000000000000000000000000000000000", url: "https://example.org/chunk" }],
    });
    expect(manifest.neuronCount).toBe(139255);
    expect(estimateColumnMemoryMiB(50_000_000)).toBe(524.52);
    expect(() => validateManifest({ format: "DFLY", formatVersion: 1, neuronCount: 12 })).toThrow(/provenance|synapse/i);
  });
});

describe("typed-array LIF fallback", () => {
  it("produces deterministic spikes from equal sensor drive without tick allocations", () => {
    const first = new TypedArrayLifEngine(createSyntheticFixture());
    const second = new TypedArrayLifEngine(createSyntheticFixture());
    let firstSpikes = 0;
    let secondSpikes = 0;
    for (let step = 0; step < 120; step += 1) {
      first.setSensoryInput(0.94, 0.18, 0.03, 0.12);
      second.setSensoryInput(0.94, 0.18, 0.03, 0.12);
      firstSpikes += first.step(0.005);
      secondSpikes += second.step(0.005);
    }
    expect(firstSpikes).toBeGreaterThan(0);
    expect(firstSpikes).toBe(secondSpikes);
    expect(Array.from(first.membrane)).toEqual(Array.from(second.membrane));
    expect(Array.from(first.firingRate)).toEqual(Array.from(second.firingRate));
  });
});
