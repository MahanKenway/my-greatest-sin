/**
 * Luminous Connectome Lab: site-level sign/weight readiness is checksum- and adapter-gated.
 * This module never supplies a CPU full-graph fallback or body-control output.
 */
import { requestFlywireExecutionDevice } from "./flywireAdapterCapability";
import { assertLifSignManifestReady, SHIU_LIF_PARAMETERS, type LifSignManifestSummary } from "./flywireLifKernel";
import { validateRealPackManifest } from "./manifest";
import type { ConnectomeManifest } from "@/game/shared/types";

export const SITE_LEVEL_SIGN_MANIFEST_URL = "/manus-storage/manifest_ce921820.json";
export const SITE_LEVEL_LIF_MANIFEST_URL = "/manus-storage/manifest-web_3e9bbe2c.json";

export const LIF_SETTINGS_BOUNDS = {
  synapticWeightMilliVolts: { min: 0.05, max: 0.5, step: 0.025 },
  poissonInputScale: { min: 0, max: 500, step: 25 },
} as const;

export type FlywireLifSettings = {
  synapticWeightMilliVolts: number;
  poissonInputScale: number;
};

export const DEFAULT_FLYWIRE_LIF_SETTINGS: FlywireLifSettings = {
  synapticWeightMilliVolts: SHIU_LIF_PARAMETERS.synapticWeightMilliVolts,
  poissonInputScale: SHIU_LIF_PARAMETERS.poissonInputScale,
};

export type FlywireSiteLevelLifReadiness = {
  state: "IDLE" | "CHECKING" | "READY" | "BLOCKED" | "ERROR";
  stage: "SIGN" | "DEVICE" | "BUDGET" | "READY" | "NONE";
  message: string;
  signCounts?: LifSignManifestSummary["counts"];
  budget?: { largestBindingMiB: number; estimatedResidentMiB: number };
};

export function validateFlywireLifSettings(settings: FlywireLifSettings): FlywireLifSettings {
  for (const [key, bounds] of Object.entries(LIF_SETTINGS_BOUNDS) as Array<[keyof FlywireLifSettings, { min: number; max: number; step: number }]>) {
    if (!Number.isFinite(settings[key]) || settings[key] < bounds.min || settings[key] > bounds.max) throw new Error(`${key} must be within ${bounds.min}–${bounds.max}.`);
  }
  return { ...settings };
}

export function assessSiteLevelSignReadiness(rawManifest: unknown, expectedNeuronCount: number): FlywireSiteLevelLifReadiness {
  const manifest = readSignSummary(rawManifest);
  const budget = { largestBindingMiB: Math.ceil(expectedNeuronCount * Int32Array.BYTES_PER_ELEMENT / 1_048_576 * 100) / 100, estimatedResidentMiB: 0 };
  try {
    assertLifSignManifestReady(manifest, expectedNeuronCount);
    return { state: "READY", stage: "DEVICE", message: "Site-level sign derivative is complete; WebGPU adapter and buffer preflight are next.", signCounts: manifest.counts, budget };
  } catch (error) {
    return { state: "BLOCKED", stage: "SIGN", message: error instanceof Error ? error.message : "Site-level sign validation failed.", signCounts: manifest.counts, budget };
  }
}

export async function preflightFlywireSiteLevelLif(settings: FlywireLifSettings): Promise<FlywireSiteLevelLifReadiness> {
  validateFlywireLifSettings(settings);
  const [signResponse, candidateResponse] = await Promise.all([
    fetch(SITE_LEVEL_SIGN_MANIFEST_URL, { cache: "no-store", headers: { Accept: "application/json" } }),
    fetch(SITE_LEVEL_LIF_MANIFEST_URL, { cache: "no-store", headers: { Accept: "application/json" } }),
  ]);
  if (!signResponse.ok) throw new Error(`Site-level sign manifest returned HTTP ${signResponse.status}.`);
  if (!candidateResponse.ok) throw new Error(`LIF candidate manifest returned HTTP ${candidateResponse.status}.`);
  const candidate = validateRealPackManifest(await candidateResponse.json());
  const signReadiness = assessSiteLevelSignReadiness(await signResponse.json(), candidate.neuronCount);
  const budget = estimateSignAwareLifBudget(candidate);
  if (signReadiness.state === "BLOCKED") return { ...signReadiness, budget };

  const capability = await requestFlywireExecutionDevice(candidate);
  if (capability.state === "BLOCKED") return { state: "BLOCKED", stage: "DEVICE", message: capability.message, signCounts: signReadiness.signCounts, budget };
  if ((capability.maxStorageBufferBindingBytes ?? Infinity) < budget.largestBindingMiB * 1_048_576 || (capability.maxBufferBytes ?? Infinity) < budget.largestBindingMiB * 1_048_576) {
    capability.device?.destroy?.();
    return { state: "BLOCKED", stage: "BUDGET", message: "This WebGPU adapter cannot bind the largest sign-aware LIF column.", signCounts: signReadiness.signCounts, budget };
  }
  capability.device?.destroy?.();
  return { state: "READY", stage: "READY", message: "Site-level sign gate, adapter and buffer preflight passed. A checksum-verified signed-LIF dispatch can now be implemented without a CPU fallback.", signCounts: signReadiness.signCounts, budget };
}

function estimateSignAwareLifBudget(manifest: ConnectomeManifest) {
  const edgeColumns = ["incoming_offsets", "source_index", "synapse_count"] as const;
  const edgeBytes = edgeColumns.reduce((total, column) => total + getColumnBytes(manifest, column), 0);
  const stateBytes = manifest.neuronCount * Float32Array.BYTES_PER_ELEMENT;
  const signBytes = manifest.neuronCount * Int32Array.BYTES_PER_ELEMENT;
  const largestBinding = Math.max(...edgeColumns.map((column) => getColumnBytes(manifest, column)), signBytes);
  // Four f32 state arrays: membrane, conductance, refractory and external input; spike history is separately budgeted.
  const resident = edgeBytes + signBytes + stateBytes * 5;
  return {
    largestBindingMiB: Math.ceil(largestBinding / 1_048_576 * 100) / 100,
    estimatedResidentMiB: Math.ceil(resident / 1_048_576 * 100) / 100,
  };
}

function getColumnBytes(manifest: ConnectomeManifest, column: "incoming_offsets" | "source_index" | "synapse_count") {
  const descriptor = manifest.columns?.[column];
  if (!descriptor) throw new Error(`LIF candidate manifest lacks ${column}.`);
  return descriptor.chunks.reduce((total, chunkId) => {
    const chunk = manifest.chunks.find((candidate) => candidate.id === chunkId);
    if (!chunk) throw new Error(`LIF candidate manifest has no ${chunkId} chunk.`);
    return total + chunk.bytes;
  }, 0);
}

function readSignSummary(rawManifest: unknown): LifSignManifestSummary {
  if (!rawManifest || typeof rawManifest !== "object") throw new Error("Site-level sign manifest is not an object.");
  const raw = rawManifest as Record<string, any>;
  const counts = raw.counts;
  const rule = raw.classificationRule;
  if (!counts || !rule || !Number.isInteger(raw.neuronCount) || !Number.isInteger(counts.excitatory) || !Number.isInteger(counts.inhibitory) || !Number.isInteger(counts.unclassified)) {
    throw new Error("Site-level sign manifest has an invalid summary schema.");
  }
  return {
    format: String(raw.format), release: String(raw.release), neuronCount: raw.neuronCount,
    counts: { excitatory: counts.excitatory, inhibitory: counts.inhibitory, unclassified: counts.unclassified },
    classificationRule: { cleftScoreCutoff: Number(rule.cleftScoreCutoff), inhibitoryCondition: String(rule.inhibitoryCondition) },
  };
}
