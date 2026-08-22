/** Luminous Connectome Lab: a preallocated LIF fallback with incoming CSR propagation. */
import type { ConnectomeColumns } from "@/game/shared/types";

export class TypedArrayLifEngine {
  readonly membrane: Float32Array;
  readonly spikes: Uint8Array;
  readonly firingRate: Float32Array;
  readonly refractory: Float32Array;
  private readonly externalInput: Float32Array;
  private readonly previousSpikes: Uint8Array;

  constructor(private readonly columns: ConnectomeColumns) {
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
    this.assign(0, 4, food * 1.25);
    this.assign(4, 4, leftCue * 1.15);
    this.assign(8, 4, rightCue * 1.15);
    this.assign(12, 4, reactive * 1.05);
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

  private assign(start: number, length: number, amount: number): void {
    for (let offset = 0; offset < length; offset += 1) this.externalInput[start + offset] = amount;
  }
}
