/** Luminous Connectome Lab: manifests must carry source provenance before browser cache or simulation activation. */
import { describe, expect, it } from "vitest";
import { preflightPack, sha256Hex } from "./loader";
import { validateRealPackManifest } from "./manifest";

const digest = "9f64a747e1b97f131fabb6b447296c9b6f0201e79fb3c5356e6c77e89b6a806a";

describe("DFLY browser loader", () => {
  it("accepts a provenance-rich real-pack manifest and computes a conservative preflight", () => {
    const manifest = validateRealPackManifest({
      format: "DFLY", formatVersion: 1, datasetId: "flywire-v783-proofread-connections", release: "783", origin: "https://zenodo.org/records/10676866", license: "CC BY-NC 4.0", neuronCount: 139255, synapseCount: 50_000_000,
      provenance: { sourceFiles: [{ name: "proofread_connections_783.feather", sha256: digest }], citations: ["Dorkenwald et al. (2024)"], transform: { name: "digital-fly-build-v783-pack", version: "1" } },
      columns: { root_id: { scalarType: "u64", elementCount: 139255, stride: 1, semanticStatus: "SOURCE DATA", chunks: ["root_id:0"] } },
      chunks: [{ id: "root_id:0", column: "root_id", path: "chunks/root-id-00000.bin", bytes: 4, sha256: digest, elementOffset: 0, elementCount: 1 }],
    });
    const preflight = preflightPack(manifest);
    expect(preflight.edgeColumnMiB).toBe(524.52);
    expect(preflight.estimatedRuntimeMiB).toBeGreaterThan(1_000);
  });

  it("creates reproducible Web Crypto checksums for chunk verification", async () => {
    const checksum = await sha256Hex(new Uint8Array([1, 2, 3, 4]).buffer);
    expect(checksum).toBe(digest);
  });
});
