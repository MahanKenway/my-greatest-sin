/**
 * Luminous Connectome Lab: bounded CPU structural propagation for one verified
 * corridor. It is not a full-FlyWire fallback and is never imported by GameWorld.
 */
import { sha256Hex } from "./loader";
import type { SugarMn9PilotProtocol } from "./sugarMn9Pilot";

export const BOUNDED_CPU_SUGAR_CORRIDOR = {
  url: "/manus-storage/cpu-corridor_743833eb.json",
  sha256: "237e23b3f2ea9a32cc9650aadc376b348f0d98ecdcd9c24242c4a54cd1322c67",
  maxNodes: 2_000,
  maxEdges: 25_000,
  propagationSteps: 4,
} as const;

export type BoundedCpuCorridorPack = {
  schema: "my-greatest-sin.cpu-corridor.v1";
  status: "CPU OFFLINE SUBGRAPH VALIDATION ONLY";
  sourceStatus: "SOURCE DATA";
  modelledInput: "MODELLED SENSOR INPUT";
  modelledDynamics: "SIGNED STRUCTURAL PROPAGATION — NOT LIF";
  limits: { maxNodes: number; maxEdges: number };
  nodeCount: number;
  edgeCount: number;
  inputIndices: number[];
  mn9Index: number;
  mn9RootId: string;
  sourceIndices: number[];
  targetIndices: number[];
  signedSynapseCounts: number[];
  provenance: Record<string, string>;
  boundary: string;
};

export type BoundedCpuCorridorResult = {
  status: "CPU OFFLINE SUBGRAPH VALIDATION";
  sourceStatus: "SOURCE DATA";
  modelledInput: "MODELLED SENSOR INPUT";
  modelledDynamics: "SIGNED STRUCTURAL PROPAGATION — NOT LIF";
  nodeCount: number;
  edgeCount: number;
  mn9RootId: string;
  mn9StructuralScore: number;
  propagationSteps: number;
  activationRateHz: number;
  inputAblation: SugarMn9PilotProtocol["inputAblation"];
  boundary: string;
};

export function validateBoundedCpuCorridorPack(candidate: unknown): BoundedCpuCorridorPack {
  if (!candidate || typeof candidate !== "object") throw new Error("CPU corridor pack is not an object.");
  const pack = candidate as Partial<BoundedCpuCorridorPack>;
  if (pack.schema !== "my-greatest-sin.cpu-corridor.v1" || pack.status !== "CPU OFFLINE SUBGRAPH VALIDATION ONLY") throw new Error("CPU corridor pack schema is not accepted.");
  const nodeCount = pack.nodeCount;
  const edgeCount = pack.edgeCount;
  if (typeof nodeCount !== "number" || typeof edgeCount !== "number" || !Number.isInteger(nodeCount) || !Number.isInteger(edgeCount) || nodeCount < 1 || edgeCount < 1) throw new Error("CPU corridor pack has invalid dimensions.");
  if (nodeCount > BOUNDED_CPU_SUGAR_CORRIDOR.maxNodes || edgeCount > BOUNDED_CPU_SUGAR_CORRIDOR.maxEdges) throw new Error("CPU corridor pack exceeds its hard safety cap; full FlyWire CPU execution is forbidden.");
  const arrays = [pack.inputIndices, pack.sourceIndices, pack.targetIndices, pack.signedSynapseCounts];
  if (arrays.some((value) => !Array.isArray(value))) throw new Error("CPU corridor pack has incomplete arrays.");
  if (pack.sourceIndices!.length !== edgeCount || pack.targetIndices!.length !== edgeCount || pack.signedSynapseCounts!.length !== edgeCount) throw new Error("CPU corridor edge-array length differs from edgeCount.");
  if (!Number.isInteger(pack.mn9Index) || pack.mn9Index! < 0 || pack.mn9Index! >= nodeCount || !pack.mn9RootId) throw new Error("CPU corridor MN9 output is invalid.");
  const indexes = [...pack.inputIndices!, ...pack.sourceIndices!, ...pack.targetIndices!, pack.mn9Index!];
  if (indexes.some((index) => !Number.isInteger(index) || index < 0 || index >= nodeCount)) throw new Error("CPU corridor contains an out-of-range index.");
  if (pack.signedSynapseCounts!.some((count) => !Number.isFinite(count) || count === 0)) throw new Error("CPU corridor has an invalid signed synapse count.");
  return pack as BoundedCpuCorridorPack;
}

export function runBoundedCpuStructuralPropagation(pack: BoundedCpuCorridorPack, input: { foodIntensity: number; protocol: SugarMn9PilotProtocol }): BoundedCpuCorridorResult {
  const boundedFood = Number.isFinite(input.foodIntensity) ? Math.max(0, Math.min(1, input.foodIntensity)) : 0;
  const boundedRate = Number.isFinite(input.protocol.activationRateHz) ? Math.max(0, Math.min(200, input.protocol.activationRateHz)) : 0;
  const injection = input.protocol.inputAblation === "CLOSED" ? 0 : boundedFood * (boundedRate / 200);
  let state = new Float32Array(pack.nodeCount);
  let next = new Float32Array(pack.nodeCount);
  const accumulated = new Float32Array(pack.nodeCount);
  for (let step = 0; step < BOUNDED_CPU_SUGAR_CORRIDOR.propagationSteps; step += 1) {
    accumulated.fill(0);
    for (let edge = 0; edge < pack.edgeCount; edge += 1) accumulated[pack.targetIndices[edge]] += state[pack.sourceIndices[edge]] * pack.signedSynapseCounts[edge];
    for (let node = 0; node < pack.nodeCount; node += 1) {
      const sensor = pack.inputIndices.includes(node) ? injection : 0;
      next[node] = Math.max(0, state[node] * 0.95 + sensor + Math.min(accumulated[node] * 0.0005, 1));
    }
    [state, next] = [next, state];
  }
  return {
    status: "CPU OFFLINE SUBGRAPH VALIDATION",
    sourceStatus: pack.sourceStatus,
    modelledInput: pack.modelledInput,
    modelledDynamics: pack.modelledDynamics,
    nodeCount: pack.nodeCount,
    edgeCount: pack.edgeCount,
    mn9RootId: pack.mn9RootId,
    mn9StructuralScore: state[pack.mn9Index] ?? 0,
    propagationSteps: BOUNDED_CPU_SUGAR_CORRIDOR.propagationSteps,
    activationRateHz: boundedRate,
    inputAblation: input.protocol.inputAblation,
    boundary: pack.boundary,
  };
}

export async function runBoundedCpuSugarCorridor(input: { foodIntensity: number; protocol: SugarMn9PilotProtocol }): Promise<BoundedCpuCorridorResult> {
  const response = await fetch(BOUNDED_CPU_SUGAR_CORRIDOR.url, { cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Bounded CPU corridor returned HTTP ${response.status}.`);
  const bytes = await response.arrayBuffer();
  if (await sha256Hex(bytes) !== BOUNDED_CPU_SUGAR_CORRIDOR.sha256) throw new Error("Bounded CPU corridor failed SHA-256 verification.");
  return runBoundedCpuStructuralPropagation(validateBoundedCpuCorridorPack(JSON.parse(new TextDecoder().decode(bytes))), input);
}
