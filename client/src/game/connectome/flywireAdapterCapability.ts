/**
 * Luminous Connectome Lab: adapter-first gates for official FlyWire execution.
 * This module never creates a CPU alternative for source-topology workloads.
 */
import type { ConnectomeManifest } from "@/game/shared/types";

const PILOT_COLUMNS = ["incoming_offsets", "source_index", "synapse_count"] as const;

export type FlywireAdapterBudget = {
  largestStorageBufferBytes: number;
  residentGpuBytes: number;
  requiredColumnBytes: Readonly<Record<(typeof PILOT_COLUMNS)[number], number>>;
};

export type FlywireAdapterCapability = {
  state: "READY" | "BLOCKED";
  message: string;
  budget: FlywireAdapterBudget;
  maxStorageBufferBindingBytes: number | null;
  maxBufferBytes: number | null;
  timestampQueryAvailable: boolean | null;
  device?: any;
};

type GpuNavigator = Navigator & { gpu?: { requestAdapter: () => Promise<any | null> } };

export function estimateFlywirePilotBudget(manifest: ConnectomeManifest): FlywireAdapterBudget {
  const requiredColumnBytes = Object.fromEntries(PILOT_COLUMNS.map((column) => [column, getColumnBytes(manifest, column)])) as FlywireAdapterBudget["requiredColumnBytes"];
  const largestStorageBufferBytes = Math.max(...Object.values(requiredColumnBytes));
  // Three f32 state-sized buffers: external sugar input, ping state, pong state.
  const residentGpuBytes = Object.values(requiredColumnBytes).reduce((total, bytes) => total + bytes, 0) + manifest.neuronCount * Float32Array.BYTES_PER_ELEMENT * 3 + 64;
  return { largestStorageBufferBytes, residentGpuBytes, requiredColumnBytes };
}

export async function requestFlywireExecutionDevice(manifest: ConnectomeManifest): Promise<FlywireAdapterCapability> {
  const budget = estimateFlywirePilotBudget(manifest);
  const gpu = (navigator as GpuNavigator).gpu;
  if (!gpu) return blocked("WebGPU is unavailable; official FlyWire execution remains blocked and CPU fallback is forbidden.", budget);
  const adapter = await gpu.requestAdapter();
  if (!adapter) return blocked("WebGPU adapter request was rejected; official FlyWire execution remains blocked.", budget);
  const maxStorageBufferBindingBytes = Number(adapter.limits?.maxStorageBufferBindingSize ?? 0) || null;
  const maxBufferBytes = Number(adapter.limits?.maxBufferSize ?? 0) || null;
  const timestampQueryAvailable = typeof adapter.features?.has === "function" ? adapter.features.has("timestamp-query") : null;
  if ((maxStorageBufferBindingBytes !== null && maxStorageBufferBindingBytes < budget.largestStorageBufferBytes) || (maxBufferBytes !== null && maxBufferBytes < budget.largestStorageBufferBytes)) {
    return { state: "BLOCKED", message: "This WebGPU adapter cannot bind the largest checksum-verified FlyWire v783 source column.", budget, maxStorageBufferBindingBytes, maxBufferBytes, timestampQueryAvailable };
  }
  try {
    const device = await adapter.requestDevice();
    return { state: "READY", message: "WebGPU adapter and storage-buffer limits satisfy the selected FlyWire v783 pilot. This does not activate GameWorld by itself.", budget, maxStorageBufferBindingBytes, maxBufferBytes, timestampQueryAvailable, device };
  } catch (error) {
    return { state: "BLOCKED", message: `WebGPU device request failed: ${error instanceof Error ? error.message : "unknown error"}`, budget, maxStorageBufferBindingBytes, maxBufferBytes, timestampQueryAvailable };
  }
}

function blocked(message: string, budget: FlywireAdapterBudget): FlywireAdapterCapability {
  return { state: "BLOCKED", message, budget, maxStorageBufferBindingBytes: null, maxBufferBytes: null, timestampQueryAvailable: null };
}

function getColumnBytes(manifest: ConnectomeManifest, column: (typeof PILOT_COLUMNS)[number]): number {
  const descriptor = manifest.columns?.[column];
  if (!descriptor) throw new Error(`Official FlyWire manifest lacks required ${column} column.`);
  return descriptor.chunks.reduce((total, chunkId) => {
    const chunk = manifest.chunks.find((candidate) => candidate.id === chunkId);
    if (!chunk) throw new Error(`Official FlyWire manifest lacks chunk ${chunkId} for ${column}.`);
    return total + chunk.bytes;
  }, 0);
}
