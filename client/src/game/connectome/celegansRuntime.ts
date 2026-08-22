/** Luminous Connectome Lab: hydrate the cited C. elegans source graph, then label all runtime mappings explicitly. */
import { fetchChunk, sha256Hex } from "./loader";
import { validateRealPackManifest } from "./manifest";
import type { ConnectomeColumns, ConnectomeExecution, ConnectomeManifest, NeuralRouting } from "@/game/shared/types";

export const CELEGANS_MANIFEST_URL = "/manus-storage/manifest.base_d3830795.json";

export type CElegansRuntime = {
  columns: ConnectomeColumns;
  routing: NeuralRouting;
  execution: ConnectomeExecution;
  manifest: ConnectomeManifest;
};

type BinaryParts = Record<string, ArrayBuffer>;

export async function loadCElegansRuntime(manifestUrl = CELEGANS_MANIFEST_URL): Promise<CElegansRuntime> {
  const response = await fetch(manifestUrl, { cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`C. elegans manifest request failed with HTTP ${response.status}.`);
  const manifest = validateRealPackManifest(await response.json());
  const parts: BinaryParts = {};
  for (const column of ["cell_index", "incoming_offsets", "source_index", "connection_weight", "connection_kind"]) {
    const chunk = manifest.chunks.find((candidate) => candidate.column === column);
    if (!chunk) throw new Error(`C. elegans manifest is missing the ${column} chunk.`);
    const chunkResponse = await fetchChunk(manifestUrl, chunk);
    const data = await chunkResponse.arrayBuffer();
    if (data.byteLength !== chunk.bytes) throw new Error(`C. elegans chunk ${chunk.id} has ${data.byteLength} bytes; expected ${chunk.bytes}.`);
    if (await sha256Hex(data) !== chunk.sha256.toLowerCase()) throw new Error(`C. elegans chunk ${chunk.id} failed SHA-256 verification.`);
    parts[column] = data;
  }
  return buildCElegansRuntime(manifest, parts);
}

export function buildCElegansRuntime(manifest: ConnectomeManifest, parts: BinaryParts): CElegansRuntime {
  const cells = manifest.dictionaries?.cellNames;
  if (!cells || cells.length !== manifest.neuronCount) throw new Error("C. elegans manifest is missing its complete cell-name dictionary.");
  const indices = new Uint32Array(parts.cell_index);
  const offsets = new Uint32Array(parts.incoming_offsets);
  const sources = new Uint32Array(parts.source_index);
  const rawWeights = new Float32Array(parts.connection_weight);
  const kinds = new Uint16Array(parts.connection_kind);
  if (indices.length !== manifest.neuronCount || offsets.length !== manifest.neuronCount + 1 || sources.length !== manifest.synapseCount || rawWeights.length !== manifest.synapseCount || kinds.length !== manifest.synapseCount) {
    throw new Error("C. elegans DFLY column lengths do not match manifest dimensions.");
  }
  if (offsets[offsets.length - 1] !== manifest.synapseCount) throw new Error("C. elegans incoming CSR offsets do not end at the source edge count.");
  for (let index = 0; index < indices.length; index += 1) if (indices[index] !== index) throw new Error("C. elegans cell-index column is not compact and ordered.");
  const maxRawWeight = Math.max(1, ...rawWeights);
  const runtimeWeights = new Float32Array(rawWeights.length);
  const runtimeFlags = new Uint8Array(kinds.length);
  for (let edge = 0; edge < rawWeights.length; edge += 1) {
    runtimeFlags[edge] = kinds[edge] === 1 ? 1 : 0;
    runtimeWeights[edge] = (rawWeights[edge] / maxRawWeight) * (runtimeFlags[edge] ? 0.1 : 0.16);
  }
  const positions = modelledWormPositions(cells.length);
  const columns: ConnectomeColumns = {
    neuronCount: manifest.neuronCount,
    synapseCount: manifest.synapseCount,
    incomingOffsets: offsets,
    incomingSources: sources,
    incomingWeights: runtimeWeights,
    incomingDelays: new Uint16Array(manifest.synapseCount).fill(1),
    incomingFlags: runtimeFlags,
    regionIndex: new Uint16Array(manifest.neuronCount),
    positions,
    provenance: "SOURCE DATA",
  };
  return {
    columns,
    routing: buildRouting(cells),
    execution: {
      topology: "SOURCE DATA",
      label: "C. ELEGANS SOURCE CONNECTOME",
      detail: `${manifest.neuronCount} connected source neurons and ${manifest.synapseCount.toLocaleString()} source edges execute on CPU. Sensory routing, weight normalization, delay, motor grouping and body motion remain modelled mappings.`,
    },
    manifest,
  };
}

function buildRouting(cells: ReadonlyArray<string>): NeuralRouting {
  const byPrefix = (...prefixes: string[]) => cells.flatMap((cell, index) => prefixes.some((prefix) => cell.startsWith(prefix)) ? [index] : []);
  return {
    sensory: {
      food: byPrefix("ASE", "ASG", "ASI", "ASJ", "ASK", "ADF"),
      leftCue: byPrefix("AWAL", "AWBL", "AWCL", "ASEL"),
      rightCue: byPrefix("AWAR", "AWBR", "AWCR", "ASER"),
      reactive: byPrefix("ASH", "ALM", "AVM", "PLM", "PVM"),
    },
    motor: {
      forward: byPrefix("VB", "DB"),
      left: byPrefix("VA", "DA"),
      right: byPrefix("VD", "DD"),
      reactive: byPrefix("AVA", "AVB", "AVD", "PVC"),
    },
  };
}

function modelledWormPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const t = index / Math.max(1, count - 1);
    const offset = index * 3;
    positions[offset] = (t - 0.5) * 2.8;
    positions[offset + 1] = 0.32 + Math.sin(t * Math.PI * 8) * 0.14;
    positions[offset + 2] = Math.cos(t * Math.PI * 5) * 0.22;
  }
  return positions;
}
