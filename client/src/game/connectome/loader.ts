/**
 * Luminous Connectome Lab: manifest-first browser loading for separately hosted DFLY packs.
 * This stage validates and caches source-preserving chunks; it does not yet activate a real pack in the LIF runtime.
 */
import type { ConnectomeManifest, DflyPackPreflight, DflyPackStatus } from "@/game/shared/types";
import { estimateColumnMemoryMiB, validateRealPackManifest } from "./manifest";

const DATABASE_NAME = "digital-fly-dfly-cache";
const DATABASE_VERSION = 1;
const STORE_NAME = "chunks";

type DeviceMemoryNavigator = Navigator & { deviceMemory?: number };

export async function inspectRemotePack(manifestUrl: string): Promise<DflyPackStatus> {
  try {
    const response = await fetch(manifestUrl, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Manifest request failed with HTTP ${response.status}.`);
    const manifest = validateRealPackManifest(await response.json());
    const preflight = preflightPack(manifest);
    if (!preflight.compatible) return { state: "BLOCKED", message: preflight.reason, manifest, preflight };
    const cachedChunks = await countCachedChunks(manifest);
    if (cachedChunks === manifest.chunks.length) {
      return { state: "CACHED", message: "All validated DFLY chunks are already available in local browser storage.", manifest, preflight, cachedChunks };
    }
    return { state: "VALIDATED", message: "Manifest provenance, structure, and device preflight passed. Data execution remains staged until the sparse backend is enabled.", manifest, preflight };
  } catch (error) {
    return { state: "ERROR", message: error instanceof Error ? error.message : "Unknown DFLY manifest error." };
  }
}

export function preflightPack(manifest: ConnectomeManifest): DflyPackPreflight {
  const packBytes = manifest.chunks.reduce((sum, chunk) => sum + chunk.bytes, 0);
  const edgeColumnMiB = estimateColumnMemoryMiB(manifest.synapseCount);
  const estimatedRuntimeMiB = Math.round((edgeColumnMiB * 2.35 + manifest.neuronCount * 4 * 8 / 1_048_576) * 100) / 100;
  const deviceMemoryGiB = typeof navigator !== "undefined" ? (navigator as DeviceMemoryNavigator).deviceMemory ?? null : null;
  const browserBudgetMiB = deviceMemoryGiB ? deviceMemoryGiB * 1024 * 0.45 : 1024;
  const compatible = estimatedRuntimeMiB <= browserBudgetMiB;
  return {
    packBytes,
    edgeColumnMiB,
    estimatedRuntimeMiB,
    deviceMemoryGiB,
    compatible,
    reason: compatible
      ? `Estimated runtime requirement is ${estimatedRuntimeMiB.toFixed(0)} MiB; activation remains subject to WebGPU buffer limits.`
      : `Estimated runtime requirement is ${estimatedRuntimeMiB.toFixed(0)} MiB, above the conservative ${browserBudgetMiB.toFixed(0)} MiB browser budget for this device.`,
  };
}

export async function cacheManifestChunks(manifestUrl: string, manifest: ConnectomeManifest, onProgress?: (completed: number, total: number) => void): Promise<number> {
  let completed = 0;
  for (const chunk of manifest.chunks) {
    const cached = await readCachedChunk(manifest, chunk.id);
    if (cached) {
      completed += 1;
      onProgress?.(completed, manifest.chunks.length);
      continue;
    }
    const response = await fetchChunk(manifestUrl, chunk);
    const data = await response.arrayBuffer();
    if (data.byteLength !== chunk.bytes && !chunk.byteRange) throw new Error(`Chunk ${chunk.id} has ${data.byteLength} bytes; expected ${chunk.bytes}.`);
    const digest = await sha256Hex(data);
    if (digest !== chunk.sha256.toLowerCase()) throw new Error(`Chunk ${chunk.id} failed SHA-256 verification.`);
    await writeCachedChunk(manifest, chunk.id, data);
    completed += 1;
    onProgress?.(completed, manifest.chunks.length);
  }
  return completed;
}

export async function fetchChunk(manifestUrl: string, chunk: ConnectomeManifest["chunks"][number]): Promise<Response> {
  const url = chunk.url ?? new URL(chunk.path ?? "", manifestUrl).toString();
  const headers = new Headers();
  if (chunk.byteRange) headers.set("Range", `bytes=${chunk.byteRange.start}-${chunk.byteRange.end}`);
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Chunk ${chunk.id} request failed with HTTP ${response.status}.`);
  if (chunk.byteRange && response.status !== 206 && response.status !== 200) throw new Error(`Chunk ${chunk.id} host did not satisfy the requested byte range.`);
  return response;
}

export async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error("Web Crypto is required to verify DFLY chunk checksums.");
  const digest = await globalThis.crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function cacheKey(manifest: ConnectomeManifest, chunkId: string): string {
  const transform = manifest.provenance?.transform;
  return [manifest.datasetId, manifest.release, transform?.name ?? "unversioned", transform?.version ?? "0", chunkId].join("::");
}

async function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return null;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onerror = () => reject(request.error ?? new Error("Unable to open DFLY cache."));
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
  });
}

async function readCachedChunk(manifest: ConnectomeManifest, chunkId: string): Promise<ArrayBuffer | null> {
  const database = await openDatabase();
  if (!database) return null;
  return new Promise<ArrayBuffer | null>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(cacheKey(manifest, chunkId));
    request.onerror = () => reject(request.error ?? new Error("Unable to read DFLY chunk cache."));
    request.onsuccess = () => resolve((request.result as ArrayBuffer | undefined) ?? null);
  }).finally(() => database.close());
}

async function writeCachedChunk(manifest: ConnectomeManifest, chunkId: string, data: ArrayBuffer): Promise<void> {
  const database = await openDatabase();
  if (!database) return;
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Unable to write DFLY chunk cache."));
    transaction.objectStore(STORE_NAME).put(data, cacheKey(manifest, chunkId));
  }).finally(() => database.close());
}

async function countCachedChunks(manifest: ConnectomeManifest): Promise<number> {
  let count = 0;
  for (const chunk of manifest.chunks) {
    if (await readCachedChunk(manifest, chunk.id)) count += 1;
  }
  return count;
}
