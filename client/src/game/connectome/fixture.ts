/**
 * Luminous Connectome Lab: the only bundled graph is a disclosed deterministic software fixture.
 * It proves data flow without making a biological-data claim or allocating object-per-neuron runtime state.
 */
import { SeededRng } from "@/game/shared/rng";
import type { ConnectomeColumns } from "@/game/shared/types";

const NEURON_COUNT = 96;
const MAX_EDGES = 2_048;

export function createSyntheticFixture(): ConnectomeColumns {
  const rawSources = new Uint32Array(MAX_EDGES);
  const rawTargets = new Uint32Array(MAX_EDGES);
  const rawWeights = new Float32Array(MAX_EDGES);
  let edgeCount = 0;
  const add = (source: number, target: number, weight: number) => {
    rawSources[edgeCount] = source;
    rawTargets[edgeCount] = target;
    rawWeights[edgeCount] = weight;
    edgeCount += 1;
  };

  // 0–15 sensory, 16–63 interneuron, 64–95 modelled motor readout groups.
  for (let sensory = 0; sensory < 4; sensory += 1) {
    for (let relay = 16; relay < 32; relay += 1) add(sensory, relay, 0.85);
  }
  for (let sensory = 4; sensory < 8; sensory += 1) {
    for (let relay = 32; relay < 40; relay += 1) add(sensory, relay, 0.9);
  }
  for (let sensory = 8; sensory < 12; sensory += 1) {
    for (let relay = 40; relay < 48; relay += 1) add(sensory, relay, 0.9);
  }
  for (let sensory = 12; sensory < 16; sensory += 1) {
    for (let relay = 48; relay < 56; relay += 1) add(sensory, relay, 0.75);
  }
  for (let relay = 16; relay < 32; relay += 1) {
    for (let motor = 64; motor < 72; motor += 1) add(relay, motor, 0.56);
  }
  for (let relay = 32; relay < 40; relay += 1) {
    for (let motor = 72; motor < 80; motor += 1) add(relay, motor, 0.62);
  }
  for (let relay = 40; relay < 48; relay += 1) {
    for (let motor = 80; motor < 88; motor += 1) add(relay, motor, 0.62);
  }
  for (let relay = 48; relay < 56; relay += 1) {
    for (let motor = 88; motor < 96; motor += 1) add(relay, motor, 0.5);
  }

  const rng = new SeededRng();
  for (let source = 16; source < 56; source += 1) {
    for (let repeat = 0; repeat < 3; repeat += 1) {
      const target = 16 + Math.floor(rng.next() * 40);
      add(source, target, 0.12 + rng.next() * 0.18);
    }
  }

  const incomingCounts = new Uint32Array(NEURON_COUNT);
  for (let edge = 0; edge < edgeCount; edge += 1) incomingCounts[rawTargets[edge]] += 1;
  const incomingOffsets = new Uint32Array(NEURON_COUNT + 1);
  for (let neuron = 0; neuron < NEURON_COUNT; neuron += 1) {
    incomingOffsets[neuron + 1] = incomingOffsets[neuron] + incomingCounts[neuron];
  }
  const cursors = incomingOffsets.slice(0, NEURON_COUNT);
  const incomingSources = new Uint32Array(edgeCount);
  const incomingWeights = new Float32Array(edgeCount);
  for (let edge = 0; edge < edgeCount; edge += 1) {
    const target = rawTargets[edge];
    const destination = cursors[target];
    incomingSources[destination] = rawSources[edge];
    incomingWeights[destination] = rawWeights[edge];
    cursors[target] += 1;
  }

  const regionIndex = new Uint16Array(NEURON_COUNT);
  const positions = new Float32Array(NEURON_COUNT * 3);
  for (let neuron = 0; neuron < NEURON_COUNT; neuron += 1) {
    regionIndex[neuron] = Math.floor(neuron / 16);
    const band = neuron % 16;
    positions[neuron * 3] = ((band % 4) - 1.5) * 0.18 + (neuron < 48 ? -0.32 : 0.32);
    positions[neuron * 3 + 1] = (Math.floor(band / 4) - 1.5) * 0.18;
    positions[neuron * 3 + 2] = (neuron % 3) * 0.08;
  }

  return {
    neuronCount: NEURON_COUNT,
    synapseCount: edgeCount,
    incomingOffsets,
    incomingSources,
    incomingWeights,
    incomingDelays: new Uint16Array(edgeCount),
    incomingFlags: new Uint8Array(edgeCount),
    regionIndex,
    positions,
    provenance: "SYNTHETIC TEST FIXTURE",
  };
}
