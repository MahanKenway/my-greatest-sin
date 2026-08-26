/**
 * Luminous Connectome Lab: source-parameterized LIF kernel contract. This file
 * is deliberately not wired to GameWorld until the v783 site-level sign pack
 * and a real WebGPU execution both pass their gates.
 */

export const SHIU_LIF_PARAMETERS = {
  restingMilliVolts: -52,
  resetMilliVolts: -52,
  thresholdMilliVolts: -45,
  membraneTimeConstantMs: 20,
  synapseDecayMs: 5,
  refractoryMs: 2.2,
  synapticDelayMs: 1.8,
  synapticWeightMilliVolts: 0.275,
  poissonInputScale: 250,
} as const;

export type FlywireNeuronSign = -1 | 0 | 1;

/** Shiu et al. classification: strictly more than half inhibitory wins. */
export function classifyNeuronSign(totalPresynapticSites: number, inhibitoryPresynapticSites: number): FlywireNeuronSign {
  if (!Number.isInteger(totalPresynapticSites) || !Number.isInteger(inhibitoryPresynapticSites) || totalPresynapticSites < 0 || inhibitoryPresynapticSites < 0 || inhibitoryPresynapticSites > totalPresynapticSites) {
    throw new Error("Neuron-sign counts must be non-negative integers with inhibitory sites bounded by total sites.");
  }
  if (totalPresynapticSites === 0) return 0;
  return inhibitoryPresynapticSites * 2 > totalPresynapticSites ? -1 : 1;
}

export function signedSynapticWeightMilliVolts(synapseCount: number, sourceSign: FlywireNeuronSign): number {
  if (!Number.isFinite(synapseCount) || synapseCount < 0) throw new Error("Synapse count must be a non-negative finite number.");
  if (sourceSign === 0) throw new Error("An unclassified source neuron cannot be assigned an LIF synaptic sign.");
  return synapseCount * sourceSign * SHIU_LIF_PARAMETERS.synapticWeightMilliVolts;
}

export type LifSignManifestSummary = {
  format: string;
  release: string;
  neuronCount: number;
  counts: { excitatory: number; inhibitory: number; unclassified: number };
  classificationRule: { cleftScoreCutoff: number; inhibitoryCondition: string };
};

export function assertLifSignManifestReady(manifest: LifSignManifestSummary, expectedNeuronCount: number): void {
  if (manifest.format !== "DFLY-NEURON-SIGN" || manifest.release !== "783") throw new Error("LIF sign manifest must be a DFLY-NEURON-SIGN release 783 artifact.");
  if (manifest.neuronCount !== expectedNeuronCount) throw new Error("LIF sign manifest neuron count does not match the v783 CSR pack.");
  if (manifest.classificationRule.cleftScoreCutoff !== 50 || manifest.classificationRule.inhibitoryCondition !== "strictly more than half of qualifying presynaptic sites") {
    throw new Error("LIF sign manifest does not satisfy the recorded transmitter-classification rule.");
  }
  if (manifest.counts.unclassified !== 0) throw new Error("LIF execution is blocked: at least one proofread neuron has no validated neurotransmitter sign.");
}

/**
 * Prototype compute pass. `spikeHistory` is a neuronCount × delaySlots ring;
 * host code must advance readSlot/writeSlot each dt and must not run this shader
 * until `assertLifSignManifestReady` succeeds. It reports discrete spikes, not
 * a physiological claim or an activated FlyWire GameWorld.
 */
export const FLYWIRE_LIF_WGSL = /* wgsl */ `
struct Params {
  neuronCount: u32,
  delaySlots: u32,
  readSlot: u32,
  writeSlot: u32,
  dtMs: f32,
  membraneTauMs: f32,
  synapseTauMs: f32,
  refractoryMs: f32,
  restingMv: f32,
  resetMv: f32,
  thresholdMv: f32,
  weightMv: f32,
}
@group(0) @binding(0) var<storage, read> incomingOffsets: array<u32>;
@group(0) @binding(1) var<storage, read> sourceIndex: array<u32>;
@group(0) @binding(2) var<storage, read> synapseCount: array<u32>;
@group(0) @binding(3) var<storage, read> neuronSign: array<i32>;
@group(0) @binding(4) var<storage, read_write> membraneMv: array<f32>;
@group(0) @binding(5) var<storage, read_write> conductanceMv: array<f32>;
@group(0) @binding(6) var<storage, read_write> refractoryRemainingMs: array<f32>;
@group(0) @binding(7) var<storage, read_write> spikeHistory: array<u32>;
@group(0) @binding(8) var<storage, read> externalInputMv: array<f32>;
@group(0) @binding(9) var<uniform> params: Params;

@compute @workgroup_size(128)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let target = gid.x;
  if (target >= params.neuronCount) { return; }
  let readBase = params.readSlot * params.neuronCount;
  let writeBase = params.writeSlot * params.neuronCount;
  var delayedInput = 0.0;
  var edge = incomingOffsets[target];
  let end = incomingOffsets[target + 1u];
  loop {
    if (edge >= end) { break; }
    let source = sourceIndex[edge];
    let sign = neuronSign[source];
    // Host gate rejects 0 signs before dispatch; retaining the guard protects the shader contract.
    if (sign != 0 && spikeHistory[readBase + source] != 0u) {
      delayedInput = delayedInput + f32(sign) * f32(synapseCount[edge]) * params.weightMv;
    }
    edge = edge + 1u;
  }
  let decayedG = conductanceMv[target] * exp(-params.dtMs / params.synapseTauMs);
  let nextG = decayedG + delayedInput + externalInputMv[target];
  let oldRefractory = refractoryRemainingMs[target];
  if (oldRefractory > 0.0) {
    membraneMv[target] = params.resetMv;
    conductanceMv[target] = 0.0;
    refractoryRemainingMs[target] = max(0.0, oldRefractory - params.dtMs);
    spikeHistory[writeBase + target] = 0u;
    return;
  }
  // Membrane update is a kernel implementation target; equivalence to Brian2's linear solver is a separate validation gate.
  let nextV = membraneMv[target] + (params.restingMv - membraneMv[target] + nextG) * params.dtMs / params.membraneTauMs;
  let spiked = nextV > params.thresholdMv;
  membraneMv[target] = select(nextV, params.resetMv, spiked);
  conductanceMv[target] = select(nextG, 0.0, spiked);
  refractoryRemainingMs[target] = select(0.0, params.refractoryMs, spiked);
  spikeHistory[writeBase + target] = select(0u, 1u, spiked);
}`;
