/** Luminous Connectome Lab: strict scientific data contracts and provenance markers. */
export type Provenance = "SOURCE DATA" | "MODELLED MAPPING" | "SYNTHETIC TEST FIXTURE";

export type SpeciesId = "DROSOPHILA" | "C_ELEGANS";

export type SpeciesProfile = {
  id: SpeciesId;
  displayName: string;
  commonName: string;
  bodyLabel: string;
  sourceLabel: string;
  sourceLicense: string;
  sourceUrl: string;
};

export type SensorFrame = {
  food: number;
  odor: number;
  light: number;
  leftCue: number;
  rightCue: number;
  wind: number;
  touch: number;
  temperature: number;
  taste: number;
  provenance: Provenance;
};

export type MotorFrame = {
  forward: number;
  turn: number;
  wingLift: number;
  gait: number;
  provenance: Provenance;
};

export type ConnectomeColumns = {
  neuronCount: number;
  synapseCount: number;
  incomingOffsets: Uint32Array;
  incomingSources: Uint32Array;
  incomingWeights: Float32Array;
  incomingDelays: Uint16Array;
  incomingFlags: Uint8Array;
  regionIndex: Uint16Array;
  positions: Float32Array;
  provenance: Provenance;
};

export type NeuralRouting = {
  sensory: { food: ReadonlyArray<number>; leftCue: ReadonlyArray<number>; rightCue: ReadonlyArray<number>; reactive: ReadonlyArray<number> };
  motor: { forward: ReadonlyArray<number>; left: ReadonlyArray<number>; right: ReadonlyArray<number>; reactive: ReadonlyArray<number> };
};

export type ConnectomeExecution = {
  topology: Provenance;
  label: string;
  detail: string;
};

export type ConnectomeManifest = {
  format: "DFLY";
  formatVersion: number;
  datasetId: string;
  release: string;
  origin: string;
  license: string;
  neuronCount: number;
  synapseCount: number;
  provenance?: {
    sourceFiles: ReadonlyArray<{ name: string; sha256: string }>;
    citations: ReadonlyArray<string>;
    transform: { name: string; version: string };
  };
  dictionaries?: { neuropils?: ReadonlyArray<string>; cellNames?: ReadonlyArray<string>; connectionKinds?: ReadonlyArray<string> };
  columns?: Readonly<Record<string, { scalarType: "u16" | "u32" | "u64" | "f16" | "f32"; elementCount: number; stride: number; semanticStatus: Provenance; chunks: ReadonlyArray<string> }>>;
  chunks: ReadonlyArray<{
    id: string;
    bytes: number;
    sha256: string;
    url?: string;
    path?: string;
    column?: string;
    elementOffset?: number;
    elementCount?: number;
    byteRange?: { start: number; end: number };
  }>;
};

export type DflyPackPreflight = {
  packBytes: number;
  edgeColumnMiB: number;
  estimatedRuntimeMiB: number;
  deviceMemoryGiB: number | null;
  compatible: boolean;
  reason: string;
};

export type DflyPackStatus =
  | { state: "UNCONFIGURED"; message: string }
  | { state: "VALIDATED"; message: string; manifest: ConnectomeManifest; preflight: DflyPackPreflight }
  | { state: "CACHED"; message: string; manifest: ConnectomeManifest; preflight: DflyPackPreflight; cachedChunks: number }
  | { state: "ACTIVE"; message: string; manifest: ConnectomeManifest; preflight: DflyPackPreflight }
  | { state: "BLOCKED"; message: string; manifest: ConnectomeManifest; preflight: DflyPackPreflight }
  | { state: "ERROR"; message: string };

export type FlywireStageStatus = {
  state: "WEBGPU_UNAVAILABLE" | "BENCHMARK_REQUIRED";
  neuronCount: number;
  synapseCount: number;
  packMiB: number;
  license: "CC BY-NC 4.0";
  sourceUrl: string;
  message: string;
};

export type SimulationSnapshot = {
  timeSeconds: number;
  paused: boolean;
  backend: "CPU TypedArray" | "WebGPU available — sparse kernel staged" | "WebGPU unavailable";
  neuronCount: number;
  synapseCount: number;
  activeNeurons: number;
  spikeCount: number;
  averageRate: number;
  fps: number;
  memoryEstimateMiB: number;
  connectomeExecution: ConnectomeExecution;
  species: SpeciesProfile;
  sensor: SensorFrame;
  motor: MotorFrame;
  behavior: "ORIENTING" | "FORAGING" | "BRACING" | "IDLE";
  neuronActivity: Float32Array;
  timeline: Float32Array;
};

export type SimulationCommand =
  | { type: "toggle" }
  | { type: "step" }
  | { type: "reset" }
  | { type: "stimulus"; stimulus: "food" | "wind" | "light" | "touch" | "temperature"; amount: number }
  | { type: "demo" }
  | { type: "species"; species: SpeciesId };
