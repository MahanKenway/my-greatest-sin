/** Luminous Connectome Lab: bounded manifest validation before any real connectome allocation. */
import type { ConnectomeManifest } from "@/game/shared/types";

const MAX_NEURONS = 250_000;
const MAX_SYNAPSES = 120_000_000;

export function validateManifest(candidate: unknown): ConnectomeManifest {
  if (!candidate || typeof candidate !== "object") throw new Error("Manifest must be an object.");
  const manifest = candidate as Partial<ConnectomeManifest>;
  if (manifest.format !== "DFLY" || manifest.formatVersion !== 1) {
    throw new Error("Unsupported DFLY manifest format or version.");
  }
  const neuronCount = manifest.neuronCount;
  const synapseCount = manifest.synapseCount;
  if (typeof neuronCount !== "number" || !Number.isInteger(neuronCount) || neuronCount < 1 || neuronCount > MAX_NEURONS) {
    throw new Error("Manifest neuron count is absent or outside the supported bound.");
  }
  if (typeof synapseCount !== "number" || !Number.isInteger(synapseCount) || synapseCount < 1 || synapseCount > MAX_SYNAPSES) {
    throw new Error("Manifest synapse count is absent or outside the supported bound.");
  }
  if (!manifest.datasetId || !manifest.release || !manifest.origin || !manifest.license) {
    throw new Error("Manifest is missing required provenance fields.");
  }
  if (!Array.isArray(manifest.chunks) || manifest.chunks.length === 0) {
    throw new Error("Manifest must list one or more integrity-checked chunks.");
  }
  for (const chunk of manifest.chunks) {
    if (!chunk || typeof chunk.id !== "string" || typeof chunk.bytes !== "number" || chunk.bytes < 1 || typeof chunk.sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(chunk.sha256)) {
      throw new Error("Manifest contains an invalid integrity-checked chunk descriptor.");
    }
    if (typeof chunk.path !== "string" && typeof chunk.url !== "string") {
      throw new Error("Every chunk must provide a relative path or an explicit URL.");
    }
  }
  return manifest as ConnectomeManifest;
}

export function validateRealPackManifest(candidate: unknown): ConnectomeManifest {
  const manifest = validateManifest(candidate);
  if (!manifest.provenance || !manifest.columns || !manifest.provenance.transform.name || !manifest.provenance.transform.version || manifest.provenance.citations.length === 0) {
    throw new Error("A real DFLY pack requires transform provenance, typed column declarations, and one or more citations.");
  }
  for (const [name, column] of Object.entries(manifest.columns)) {
    if (!Number.isInteger(column.elementCount) || column.elementCount < 1 || !Number.isInteger(column.stride) || column.stride < 1 || column.chunks.length === 0) {
      throw new Error(`Column ${name} has an invalid element or chunk declaration.`);
    }
  }
  return manifest;
}

export function estimateColumnMemoryMiB(synapseCount: number): number {
  const bytes = synapseCount * (4 + 4 + 2 + 1);
  return Math.round((bytes / 1_048_576) * 100) / 100;
}
