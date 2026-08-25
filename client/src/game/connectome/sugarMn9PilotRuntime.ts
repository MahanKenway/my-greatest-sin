/**
 * Luminous Connectome Lab: v783 source-topology pilot, gated by checksum and
 * WebGPU. It yields a structural MN9 score only — never a claim of physiology.
 */
import { fetchChunk, sha256Hex } from "./loader";
import { validateRealPackManifest } from "./manifest";
import { DEFAULT_SUGAR_MN9_PILOT_PROTOCOL, SUGAR_MN9_PILOT, type SugarMn9PilotProtocol } from "./sugarMn9Pilot";
import { requestFlywireExecutionDevice } from "./flywireAdapterCapability";
import type { ConnectomeManifest } from "@/game/shared/types";

const REQUIRED_COLUMNS = ["root_id", "incoming_offsets", "source_index", "synapse_count"] as const;
const EVIDENCE = { url: "/manus-storage/sugar-mn9-evidence_06b7fcc1.json", sha256: "60809bba02fbc6d34d0e50a3bb1ff067949619e5c2ef7674dbc22838ca09593e" };
const TWO_HOP_PATHS = { url: "/manus-storage/sugar-mn9-two-hop_6d3b2fde.json", sha256: "d30076f45dd2f9a949b716117a269b121109ea1dcde2c0c4b16a1c35f42edf10" };

export type SugarMn9PilotResult = {
  sourceStatus: "SOURCE DATA";
  modelledInput: "MODELLED SENSOR INPUT";
  modelledOutput: "MODELLED MOTOR DECODER";
  stimulusIntensity: number;
  sugarInputsPresent: number;
  mn9RootId: string;
  mn9StructuralScore: number;
  propagationSteps: number;
  evidenceTwoHopIntermediates: number;
  estimatedResidentGpuMiB: number;
  adapterMaxStorageBufferBindingBytes: number;
  timestampQueryAvailable: boolean | null;
  activationRateHz: number;
  inputAblation: SugarMn9PilotProtocol["inputAblation"];
};

export type SugarMn9PilotOptions = {
  foodIntensity: number;
  protocol?: Partial<SugarMn9PilotProtocol>;
};

/**
 * A deliberately modelled, monotonic visual decoder. The denominator is a UI
 * calibration constant, not a measured MN9 firing threshold or muscle model.
 */
export function decodeMn9StructuralScoreForProboscis(structuralScore: number): number {
  if (!Number.isFinite(structuralScore) || structuralScore <= 0) return 0;
  return structuralScore / (structuralScore + 0.0025);
}

export function normalizeSugarMn9PilotProtocol(protocol?: Partial<SugarMn9PilotProtocol>): SugarMn9PilotProtocol {
  const candidateRate = protocol?.activationRateHz ?? DEFAULT_SUGAR_MN9_PILOT_PROTOCOL.activationRateHz;
  return {
    activationRateHz: Number.isFinite(candidateRate) ? Math.max(0, Math.min(200, candidateRate)) : DEFAULT_SUGAR_MN9_PILOT_PROTOCOL.activationRateHz,
    inputAblation: protocol?.inputAblation === "CLOSED" ? "CLOSED" : "OPEN",
  };
}

export async function runSugarMn9Pilot(manifestUrl: string, input: number | SugarMn9PilotOptions): Promise<SugarMn9PilotResult> {
  const options = typeof input === "number" ? { foodIntensity: input } : input;
  const protocol = normalizeSugarMn9PilotProtocol(options.protocol);
  const [evidence, paths] = await Promise.all([fetchCheckedJson(EVIDENCE), fetchCheckedJson(TWO_HOP_PATHS)]);
  const inputsPresent = Number(evidence.sugarGrnPresent);
  const twoHopIntermediates = Number(paths.twoHopIntermediateCount);
  if (evidence.mn9PresentInProofreadRootIds !== true || inputsPresent < 1 || twoHopIntermediates < 1) {
    throw new Error("The checksum-verified sugar-GRN → MN9 source evidence is incomplete.");
  }

  const response = await fetch(manifestUrl, { cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Official pilot manifest returned HTTP ${response.status}.`);
  const manifest = validateRealPackManifest(await response.json());
  const columns = await loadRequiredColumns(manifestUrl, manifest);
  const rootIds = new BigUint64Array(columns.rootId);
  if (rootIds.length !== manifest.neuronCount) throw new Error("Official root-ID column length differs from its manifest.");
  const rootIndex = new Map<string, number>();
  for (let index = 0; index < rootIds.length; index += 1) rootIndex.set(rootIds[index].toString(), index);
  const sugarIndices = SUGAR_MN9_PILOT.inputRootIds.map((id) => rootIndex.get(id)).filter((index): index is number => index !== undefined);
  const mn9Index = rootIndex.get(SUGAR_MN9_PILOT.outputRootId);
  if (mn9Index === undefined || sugarIndices.length !== inputsPresent) throw new Error("Pilot root IDs do not agree with the verified v783 source columns.");

  const capability = await requestFlywireExecutionDevice(manifest);
  if (capability.state !== "READY" || !capability.device || capability.maxStorageBufferBindingBytes === null) throw new Error(capability.message);
  const device = capability.device;
  const usage = (globalThis as any).GPUBufferUsage;
  const mapMode = (globalThis as any).GPUMapMode;

  const stateBytes = manifest.neuronCount * Float32Array.BYTES_PER_ELEMENT;
  const boundedInput = Math.max(0, Math.min(1, options.foodIntensity));
  const structuralInjection = protocol.inputAblation === "CLOSED" ? 0 : boundedInput * (protocol.activationRateHz / 200);
  const injection = new Float32Array(manifest.neuronCount);
  for (const index of sugarIndices) injection[index] = structuralInjection;
  const offsets = createStorageBuffer(device, columns.offsets, usage);
  const source = createStorageBuffer(device, columns.source, usage);
  const synapse = createStorageBuffer(device, columns.synapse, usage);
  const injectionBuffer = createStorageBuffer(device, injection.buffer, usage);
  const stateA = createStorageBuffer(device, new Float32Array(manifest.neuronCount).buffer, usage, usage.COPY_SRC);
  const stateB = device.createBuffer({ size: stateBytes, usage: usage.STORAGE | usage.COPY_SRC | usage.COPY_DST });
  const params = new ArrayBuffer(16);
  const paramsView = new DataView(params);
  paramsView.setUint32(0, manifest.neuronCount, true);
  paramsView.setFloat32(8, 0.0005, true);
  const parameterBuffer = device.createBuffer({ size: params.byteLength, usage: usage.UNIFORM | usage.COPY_DST });
  device.queue.writeBuffer(parameterBuffer, 0, params);
  const pipeline = device.createComputePipeline({ layout: "auto", compute: { module: device.createShaderModule({ code: STRUCTURAL_PROPAGATION_WGSL }), entryPoint: "main" } });
  const makeGroup = (state: any, next: any) => device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [
    { binding: 0, resource: { buffer: offsets } }, { binding: 1, resource: { buffer: source } }, { binding: 2, resource: { buffer: synapse } },
    { binding: 3, resource: { buffer: state } }, { binding: 4, resource: { buffer: next } }, { binding: 5, resource: { buffer: parameterBuffer } }, { binding: 6, resource: { buffer: injectionBuffer } },
  ] });
  const groups = [makeGroup(stateA, stateB), makeGroup(stateB, stateA)];
  const propagationSteps = 4;
  for (let step = 0; step < propagationSteps; step += 1) {
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, groups[step % 2]);
    pass.dispatchWorkgroups(Math.ceil(manifest.neuronCount / 128));
    pass.end();
    device.queue.submit([encoder.finish()]);
  }
  const finalState = propagationSteps % 2 === 0 ? stateA : stateB;
  const readback = device.createBuffer({ size: Float32Array.BYTES_PER_ELEMENT, usage: usage.COPY_DST | usage.MAP_READ });
  const readEncoder = device.createCommandEncoder();
  readEncoder.copyBufferToBuffer(finalState, mn9Index * Float32Array.BYTES_PER_ELEMENT, readback, 0, Float32Array.BYTES_PER_ELEMENT);
  device.queue.submit([readEncoder.finish()]);
  await device.queue.onSubmittedWorkDone();
  await readback.mapAsync(mapMode.READ);
  const mn9StructuralScore = new Float32Array(readback.getMappedRange().slice(0))[0] ?? 0;
  readback.unmap();
  for (const buffer of [offsets, source, synapse, injectionBuffer, stateA, stateB, parameterBuffer, readback]) buffer.destroy();
  device.destroy();
  return { sourceStatus: "SOURCE DATA", modelledInput: "MODELLED SENSOR INPUT", modelledOutput: "MODELLED MOTOR DECODER", stimulusIntensity: boundedInput, sugarInputsPresent: sugarIndices.length, mn9RootId: SUGAR_MN9_PILOT.outputRootId, mn9StructuralScore, propagationSteps, evidenceTwoHopIntermediates: twoHopIntermediates, estimatedResidentGpuMiB: capability.budget.residentGpuBytes / (1024 * 1024), adapterMaxStorageBufferBindingBytes: capability.maxStorageBufferBindingBytes, timestampQueryAvailable: capability.timestampQueryAvailable, activationRateHz: protocol.activationRateHz, inputAblation: protocol.inputAblation };
}

async function fetchCheckedJson(resource: { url: string; sha256: string }): Promise<Record<string, unknown>> {
  const response = await fetch(resource.url, { cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Pilot source evidence returned HTTP ${response.status}.`);
  const bytes = await response.arrayBuffer();
  if (await sha256Hex(bytes) !== resource.sha256) throw new Error("Pilot source evidence failed SHA-256 verification.");
  return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
}

async function loadRequiredColumns(manifestUrl: string, manifest: ConnectomeManifest) {
  const loaded: Record<string, ArrayBuffer> = {};
  for (const columnName of REQUIRED_COLUMNS) {
    const descriptor = manifest.columns?.[columnName];
    if (!descriptor) throw new Error(`Official pilot manifest lacks ${columnName}.`);
    const chunks = descriptor.chunks.map((id) => manifest.chunks.find((chunk) => chunk.id === id)).filter(Boolean) as ConnectomeManifest["chunks"];
    if (chunks.length !== descriptor.chunks.length) throw new Error(`Official pilot manifest has an incomplete ${columnName} chunk list.`);
    const parts: ArrayBuffer[] = [];
    for (const chunk of chunks) {
      const bytes = await (await fetchChunk(manifestUrl, chunk)).arrayBuffer();
      if (bytes.byteLength !== chunk.bytes || await sha256Hex(bytes) !== chunk.sha256.toLowerCase()) throw new Error(`${chunk.id} failed source verification.`);
      parts.push(bytes);
    }
    loaded[columnName] = concatenate(parts);
  }
  return { rootId: loaded.root_id, offsets: loaded.incoming_offsets, source: loaded.source_index, synapse: loaded.synapse_count };
}

function createStorageBuffer(device: any, bytes: ArrayBuffer, usage: any, extraUsage = 0) {
  const buffer = device.createBuffer({ size: bytes.byteLength, usage: usage.STORAGE | usage.COPY_DST | extraUsage });
  device.queue.writeBuffer(buffer, 0, bytes);
  return buffer;
}

function concatenate(parts: ArrayBuffer[]): ArrayBuffer {
  const output = new Uint8Array(parts.reduce((total, part) => total + part.byteLength, 0));
  let offset = 0;
  for (const part of parts) { output.set(new Uint8Array(part), offset); offset += part.byteLength; }
  return output.buffer;
}

const STRUCTURAL_PROPAGATION_WGSL = /* wgsl */ `
struct Params { neuronCount: u32, paddingA: u32, gain: f32, paddingB: f32 }
@group(0) @binding(0) var<storage, read> offsets: array<u32>;
@group(0) @binding(1) var<storage, read> sourceIndex: array<u32>;
@group(0) @binding(2) var<storage, read> synapseCount: array<u32>;
@group(0) @binding(3) var<storage, read> state: array<f32>;
@group(0) @binding(4) var<storage, read_write> nextState: array<f32>;
@group(0) @binding(5) var<uniform> params: Params;
@group(0) @binding(6) var<storage, read> sensorInjection: array<f32>;
@compute @workgroup_size(128)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let target = gid.x;
  if (target >= params.neuronCount) { return; }
  var total = 0.0;
  var edge = offsets[target];
  let end = offsets[target + 1u];
  loop { if (edge >= end) { break; } total = total + state[sourceIndex[edge]] * f32(synapseCount[edge]); edge = edge + 1u; }
  // Structural propagation score only — not a physiological neuron model.
  nextState[target] = max(0.0, state[target] * 0.95 + sensorInjection[target] + min(total * params.gain, 1.0));
}`;
