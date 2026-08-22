/** Luminous Connectome Lab: FlyWire's full graph is staged externally; this zero-node state prevents a synthetic fly fallback. */
import type { ConnectomeColumns, ConnectomeExecution } from "@/game/shared/types";

export function createStagedFlywireColumns(): ConnectomeColumns {
  return {
    neuronCount: 0,
    synapseCount: 0,
    incomingOffsets: new Uint32Array(1),
    incomingSources: new Uint32Array(0),
    incomingWeights: new Float32Array(0),
    incomingDelays: new Uint16Array(0),
    incomingFlags: new Uint8Array(0),
    regionIndex: new Uint16Array(0),
    positions: new Float32Array(0),
    provenance: "MODELLED MAPPING",
  };
}

export function stagedFlywireExecution(): ConnectomeExecution {
  return {
    topology: "MODELLED MAPPING",
    label: "FLYWIRE V783 STAGED — NO EXECUTION",
    detail: "The official 139,255-neuron FlyWire v783 pack is held outside the public app. No 96-neuron fallback is running; sparse WebGPU benchmark and delivery approval are required before activation.",
  };
}
