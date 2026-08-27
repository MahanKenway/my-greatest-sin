/**
 * Luminous Connectome Lab: an evidence-only WebGPU throughput probe.
 * It reads four checksum-verified SOURCE DATA columns and never attaches output
 * to FlyBody, GameWorld, environmental sensors, or a motor decoder.
 */
import { fetchChunk, sha256Hex } from "./loader";
import { validateRealPackManifest } from "./manifest";
import type { ConnectomeManifest } from "@/game/shared/types";

type GpuNavigator = Navigator & {
  gpu?: { requestAdapter: () => Promise<any | null> };
};

const REQUIRED_COLUMNS = ["root_id", "incoming_offsets", "source_index", "synapse_count"] as const;

export type FlywireWebGpuBenchmark = {
  manifestUrl: string;
  neuronCount: number;
  edgeCount: number;
  fetchedMiB: number;
  residentGpuMiB: number;
  adapterName: string;
  maxStorageBufferBindingMiB: number;
  decodeMs: number;
  uploadMs: number;
  warmupMs: number;
  meanStepMs: number;
  measuredSteps: number;
};

export async function runFlywireWebGpuBenchmark(manifestUrl: string): Promise<FlywireWebGpuBenchmark> {
  const started = performance.now();
  const response = await fetch(manifestUrl, { cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Official benchmark manifest returned HTTP ${response.status}.`);
  const manifest = validateRealPackManifest(await response.json());

  const gpu = (navigator as GpuNavigator).gpu;
  if (!gpu) throw new Error("WebGPU is unavailable in this browser.");
  const adapter = await gpu.requestAdapter();
  if (!adapter) throw new Error("WebGPU adapter request was rejected.");
  const device = await adapter.requestDevice();
  const maxStorageBufferBindingSize = Number(device.limits.maxStorageBufferBindingSize ?? 0);

  const expectedColumnBytes = Object.fromEntries(REQUIRED_COLUMNS.map((column) => [column, getColumnBytes(manifest, column)])) as Record<(typeof REQUIRED_COLUMNS)[number], number>;
  const stateBytes = manifest.neuronCount * Float32Array.BYTES_PER_ELEMENT;
  const residentBytes = Object.values(expectedColumnBytes).reduce((total, bytes) => total + bytes, 0) + stateBytes * 2;
  const largestColumn = Math.max(expectedColumnBytes.source_index, expectedColumnBytes.synapse_count, expectedColumnBytes.incoming_offsets);
  if (maxStorageBufferBindingSize && largestColumn > maxStorageBufferBindingSize) {
    device.destroy();
    throw new Error(`Largest source column is ${(largestColumn / 1_048_576).toFixed(1)} MiB, above this adapter's ${(maxStorageBufferBindingSize / 1_048_576).toFixed(1)} MiB storage-buffer limit.`);
  }

  try {
    // Only a real adapter with adequate limits reaches the large checksum-verified fetch.
    const columns = await loadRequiredColumns(manifestUrl, manifest);
    const decodeMs = performance.now() - started;
    const uploadStarted = performance.now();
    const usage = (globalThis as any).GPUBufferUsage;
    const offsetsBuffer = createStorageBuffer(device, columns.offsets, usage);
    const sourceBuffer = createStorageBuffer(device, columns.source, usage);
    const synapseBuffer = createStorageBuffer(device, columns.synapse, usage);
    const state = new Float32Array(manifest.neuronCount);
    // Benchmark seed only: this is not a sensory stimulus or a scientific neural state.
    state[0] = 1;
    const stateBuffer = createStorageBuffer(device, state.buffer, usage);
    const nextBuffer = device.createBuffer({ size: stateBytes, usage: usage.STORAGE | usage.COPY_DST });
    const params = new ArrayBuffer(16);
    new DataView(params).setUint32(0, manifest.neuronCount, true);
    new DataView(params).setUint32(4, manifest.synapseCount, true);
    new DataView(params).setFloat32(8, 0.0005, true);
    const paramsBuffer = device.createBuffer({ size: params.byteLength, usage: usage.UNIFORM | usage.COPY_DST });
    device.queue.writeBuffer(paramsBuffer, 0, params);
    const uploadMs = performance.now() - uploadStarted;
    const pipeline = device.createComputePipeline({ layout: "auto", compute: { module: device.createShaderModule({ code: SPARSE_STEP_WGSL }), entryPoint: "main" } });
    const bindGroup = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: offsetsBuffer } }, { binding: 1, resource: { buffer: sourceBuffer } }, { binding: 2, resource: { buffer: synapseBuffer } }, { binding: 3, resource: { buffer: stateBuffer } }, { binding: 4, resource: { buffer: nextBuffer } }, { binding: 5, resource: { buffer: paramsBuffer } }] });
    const dispatch = () => { const encoder = device.createCommandEncoder(); const pass = encoder.beginComputePass(); pass.setPipeline(pipeline); pass.setBindGroup(0, bindGroup); pass.dispatchWorkgroups(Math.ceil(manifest.neuronCount / 128)); pass.end(); device.queue.submit([encoder.finish()]); };
    const warmupStarted = performance.now(); dispatch(); await device.queue.onSubmittedWorkDone(); const warmupMs = performance.now() - warmupStarted;
    const measuredSteps = 4; const measuredStarted = performance.now(); for (let step = 0; step < measuredSteps; step += 1) dispatch(); await device.queue.onSubmittedWorkDone(); const meanStepMs = (performance.now() - measuredStarted) / measuredSteps;
    for (const buffer of [offsetsBuffer, sourceBuffer, synapseBuffer, stateBuffer, nextBuffer, paramsBuffer]) buffer.destroy();
    return { manifestUrl, neuronCount: manifest.neuronCount, edgeCount: manifest.synapseCount, fetchedMiB: roundMiB(columns.rootId.byteLength + columns.offsets.byteLength + columns.source.byteLength + columns.synapse.byteLength), residentGpuMiB: roundMiB(residentBytes), adapterName: (adapter.info?.description || adapter.info?.vendor || "WebGPU adapter") as string, maxStorageBufferBindingMiB: roundMiB(maxStorageBufferBindingSize), decodeMs, uploadMs, warmupMs, meanStepMs, measuredSteps };
  } finally {
    device.destroy();
  }
}

async function loadRequiredColumns(manifestUrl: string, manifest: ConnectomeManifest) {
  const loaded: Record<string, ArrayBuffer> = {};
  for (const columnName of REQUIRED_COLUMNS) {
    const descriptor = manifest.columns?.[columnName];
    if (!descriptor) throw new Error(`Official benchmark manifest lacks required ${columnName} column.`);
    const chunks = descriptor.chunks.map((id) => manifest.chunks.find((chunk) => chunk.id === id)).filter(Boolean) as ConnectomeManifest["chunks"];
    if (chunks.length !== descriptor.chunks.length) throw new Error(`Official benchmark manifest has an incomplete ${columnName} chunk list.`);
    const pieces: ArrayBuffer[] = [];
    for (const chunk of chunks) {
      const response = await fetchChunk(manifestUrl, chunk);
      const bytes = await response.arrayBuffer();
      if (bytes.byteLength !== chunk.bytes) throw new Error(`${chunk.id} byte length differs from its official manifest.`);
      if (await sha256Hex(bytes) !== chunk.sha256.toLowerCase()) throw new Error(`${chunk.id} failed SHA-256 verification.`);
      pieces.push(bytes);
    }
    loaded[columnName] = concatenate(pieces);
  }
  return {
    rootId: loaded.root_id,
    offsets: loaded.incoming_offsets,
    source: loaded.source_index,
    synapse: loaded.synapse_count,
  };
}

function createStorageBuffer(device: any, bytes: ArrayBuffer, usage: any) {
  const buffer = device.createBuffer({ size: bytes.byteLength, usage: usage.STORAGE | usage.COPY_DST });
  device.queue.writeBuffer(buffer, 0, bytes);
  return buffer;
}

function concatenate(pieces: ArrayBuffer[]): ArrayBuffer {
  const byteLength = pieces.reduce((total, piece) => total + piece.byteLength, 0);
  const output = new Uint8Array(byteLength);
  let offset = 0;
  for (const piece of pieces) {
    output.set(new Uint8Array(piece), offset);
    offset += piece.byteLength;
  }
  return output.buffer;
}

function roundMiB(bytes: number) {
  return Math.round((bytes / 1_048_576) * 100) / 100;
}

function getColumnBytes(manifest: ConnectomeManifest, column: (typeof REQUIRED_COLUMNS)[number]): number {
  const descriptor = manifest.columns?.[column];
  if (!descriptor) throw new Error(`Official benchmark manifest lacks required ${column} column.`);
  return descriptor.chunks.reduce((total, chunkId) => {
    const chunk = manifest.chunks.find((candidate) => candidate.id === chunkId);
    if (!chunk) throw new Error(`Official benchmark manifest lacks chunk ${chunkId} for ${column}.`);
    return total + chunk.bytes;
  }, 0);
}

const SPARSE_STEP_WGSL = /* wgsl */ `
struct Params { neuronCount: u32, edgeCount: u32, gain: f32, padding: f32 }
@group(0) @binding(0) var<storage, read> offsets: array<u32>;
@group(0) @binding(1) var<storage, read> sourceIndex: array<u32>;
@group(0) @binding(2) var<storage, read> synapseCount: array<u32>;
@group(0) @binding(3) var<storage, read> state: array<f32>;
@group(0) @binding(4) var<storage, read_write> nextState: array<f32>;
@group(0) @binding(5) var<uniform> params: Params;

@compute @workgroup_size(128)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let target = gid.x;
  if (target >= params.neuronCount) { return; }
  var total = 0.0;
  var edge = offsets[target];
  let end = offsets[target + 1u];
  loop {
    if (edge >= end) { break; }
    total = total + state[sourceIndex[edge]] * f32(synapseCount[edge]);
    edge = edge + 1u;
  }
  nextState[target] = max(0.0, state[target] * 0.95 + min(total * params.gain, 1.0));
}`;
