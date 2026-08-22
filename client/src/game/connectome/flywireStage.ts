/** Luminous Connectome Lab: official FlyWire data may be staged locally, never executed by the CPU fallback. */
export type FlywireStageState = "WEBGPU_UNAVAILABLE" | "BENCHMARK_REQUIRED";

export type FlywireStageStatus = {
  state: FlywireStageState;
  neuronCount: number;
  synapseCount: number;
  packMiB: number;
  license: "CC BY-NC 4.0";
  sourceUrl: string;
  message: string;
};

const FLYWIRE_NEURONS = 139_255;
const FLYWIRE_EDGES = 16_847_997;
const FLYWIRE_PACK_MIB = 356;

export function inspectOfficialFlywireStage(webGpuAvailable = hasWebGpu()): FlywireStageStatus {
  return {
    state: webGpuAvailable ? "BENCHMARK_REQUIRED" : "WEBGPU_UNAVAILABLE",
    neuronCount: FLYWIRE_NEURONS,
    synapseCount: FLYWIRE_EDGES,
    packMiB: FLYWIRE_PACK_MIB,
    license: "CC BY-NC 4.0",
    sourceUrl: "https://zenodo.org/records/10676866",
    message: webGpuAvailable
      ? "Official v783 DFLY pack is staged outside the public app. Sparse WebGPU benchmark and a separately reviewed delivery gate are required before activation; CPU execution is forbidden."
      : "Official v783 DFLY pack is staged outside the public app. This browser does not expose WebGPU, so the 140k-neuron pack remains unavailable; CPU execution is forbidden.",
  };
}

function hasWebGpu(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}
