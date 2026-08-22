/** Luminous Connectome Lab: a preallocated LIF fallback with incoming CSR propagation. */
import type { ConnectomeColumns, NeuralRouting } from "@/game/shared/types";

export const FIXTURE_ROUTING: NeuralRouting = {
  sensory: { food: [0, 1, 2, 3], leftCue: [4, 5, 6, 7], rightCue: [8, 9, 10, 11], reactive: [12, 13, 14, 15] },
  motor: { forward: [64, 65, 66, 67, 68, 69, 70, 71], left: [72, 73, 74, 75, 76, 77, 78, 79], right: [80, 81, 82, 83, 84, 85, 86, 87], reactive: [88, 89, 90, 91, 92, 93, 94, 95] },
};

export class TypedArrayLifEngine {
  readonly membrane: Float32Array;
  readonly spikes: Uint8Array;
  readonly firingRate: Float32Array;
  readonly refractory: Float32Array;
  private readonly externalInput: Float32Array;
  private readonly previousSpikes: Uint8Array;

  constructor(private readonly columns: ConnectomeColumns, private readonly routing: NeuralRouting = FIXTURE_ROUTING) {
    this.membrane = new Float32Array(columns.neuronCount);
    this.spikes = new Uint8Array(columns.neuronCount);
    this.firingRate = new Float32Array(columns.neuronCount);
    this.refractory = new Float32Array(columns.neuronCount);
    this.externalInput = new Float32Array(columns.neuronCount);
    this.previousSpikes = new Uint8Array(columns.neuronCount);
  }

  reset(): void {
    this.membrane.fill(0);
    this.spikes.fill(0);
    this.firingRate.fill(0);
    this.refractory.fill(0);
    this.externalInput.fill(0);
    this.previousSpikes.fill(0);
  }

  setSensoryInput(food: number, leftCue: number, rightCue: number, reactive: number): void {
    this.externalInput.fill(0);
    this.assign(this.routing.sensory.food, food * 1.25);
    this.assign(this.routing.sensory.leftCue, leftCue * 1.15);
    this.assign(this.routing.sensory.rightCue, rightCue * 1.15);
    this.assign(this.routing.sensory.reactive, reactive * 1.05);
  }

  step(dt: number): number {
    this.previousSpikes.set(this.spikes);
    let spikeCount = 0;
    for (let target = 0; target < this.columns.neuronCount; target += 1) {
      if (this.refractory[target] > 0) {
        this.refractory[target] = Math.max(0, this.refractory[target] - dt);
        this.spikes[target] = 0;
        this.firingRate[target] *= 0.985;
        continue;
      }
      let synapticInput = this.externalInput[target];
      const start = this.columns.incomingOffsets[target];
      const end = this.columns.incomingOffsets[target + 1];
      for (let edge = start; edge < end; edge += 1) {
        synapticInput += this.previousSpikes[this.columns.incomingSources[edge]] * this.columns.incomingWeights[edge];
      }
      const potential = this.membrane[target] * 0.965 + synapticInput;
      if (potential >= 1) {
        this.spikes[target] = 1;
        this.membrane[target] = 0;
        this.refractory[target] = 0.008;
        spikeCount += 1;
      } else {
        this.spikes[target] = 0;
        this.membrane[target] = potential;
      }
      this.firingRate[target] = this.firingRate[target] * 0.94 + this.spikes[target] * 0.06;
    }
    return spikeCount;
  }

  private assign(indices: ReadonlyArray<number>, amount: number): void {
    for (const index of indices) if (index >= 0 && index < this.externalInput.length) this.externalInput[index] = amount;
  }
}
