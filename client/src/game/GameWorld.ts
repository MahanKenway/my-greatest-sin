/** Luminous Connectome Lab: framework-independent owner for fixed-step environment → sensors → neural engine → body loop. */
import type { Scene } from "@babylonjs/core/scene";
import { createSyntheticFixture } from "@/game/connectome/fixture";
import { estimateColumnMemoryMiB } from "@/game/connectome/manifest";
import { FlyBody } from "@/game/body/FlyBody";
import { Arena } from "@/game/environment/Arena";
import { NeuralEngine } from "@/game/neural/engine";
import type { MotorFrame, SensorFrame, SimulationCommand, SimulationSnapshot } from "@/game/shared/types";
import { BrainView } from "@/game/visualization/BrainView";

const DT = 0.005;

export class GameWorld {
  private readonly fixture = createSyntheticFixture();
  private readonly arena: Arena;
  private readonly neural: NeuralEngine;
  private readonly fly: FlyBody;
  private readonly brain: BrainView;
  private readonly timeline = new Float32Array(64);
  private readonly listeners = new Set<(snapshot: SimulationSnapshot) => void>();
  private elapsed = 0;
  private accumulator = 0;
  private renderTimer = 0;
  private simTime = 0;
  private paused = false;
  private demo = false;
  private spikes = 0;
  private active = 0;
  private fps = 60;
  private lastSensor: SensorFrame = { food: 0, odor: 0, light: 0, leftCue: 0, rightCue: 0, wind: 0, touch: 0, temperature: 0, taste: 0, provenance: "MODELLED MAPPING" };
  private lastMotor: MotorFrame = { forward: 0, turn: 0, wingLift: 0, gait: 0, provenance: "MODELLED MAPPING" };

  constructor(private readonly scene: Scene) {
    this.arena = new Arena(scene);
    this.neural = new NeuralEngine(this.fixture);
    this.fly = new FlyBody(scene);
    this.brain = new BrainView(scene, this.fixture);
  }

  update(renderDt: number): void {
    this.elapsed += renderDt;
    this.fps = this.fps * 0.93 + (renderDt > 0 ? 1 / renderDt : 60) * 0.07;
    if (!this.paused) {
      this.accumulator = Math.min(0.08, this.accumulator + renderDt);
      let steps = 0;
      while (this.accumulator >= DT && steps < 12) {
        this.step(DT);
        this.accumulator -= DT;
        steps += 1;
      }
    }
    this.brain.update(this.neural.cpu.firingRate, this.simTime);
    this.renderTimer += renderDt;
    if (this.renderTimer >= 0.06) {
      this.renderTimer = 0;
      this.emit();
    }
  }

  command(command: SimulationCommand): void {
    if (command.type === "toggle") this.paused = !this.paused;
    if (command.type === "step") this.step(DT);
    if (command.type === "reset") this.reset();
    if (command.type === "demo") this.demo = !this.demo;
    if (command.type === "stimulus") this.arena.apply(command.stimulus, command.amount);
    this.emit();
  }

  subscribe(listener: (snapshot: SimulationSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  dispose(): void {
    this.listeners.clear();
  }

  private step(dt: number): void {
    this.simTime += dt;
    if (this.demo) this.runDemoSchedule();
    this.lastSensor = this.arena.sample(this.fly.getPosition(), this.fly.getHeading(), dt);
    this.spikes = this.neural.step(dt, this.lastSensor);
    this.lastMotor = this.decodeMotor();
    this.fly.update(this.lastMotor, dt);
    this.timeline.copyWithin(0, 1);
    this.timeline[this.timeline.length - 1] = Math.min(1, this.spikes / 18);
    this.active = 0;
    for (let neuron = 0; neuron < this.neural.cpu.firingRate.length; neuron += 1) {
      if (this.neural.cpu.firingRate[neuron] > 0.035) this.active += 1;
    }
  }

  private decodeMotor(): MotorFrame {
    const mean = (start: number, end: number) => {
      let value = 0;
      for (let index = start; index < end; index += 1) value += this.neural.cpu.firingRate[index];
      return value / (end - start);
    };
    const forward = Math.min(1, mean(64, 72) * 8.8);
    const left = mean(72, 80) * 10;
    const right = mean(80, 88) * 10;
    const reactive = mean(88, 96) * 8;
    return {
      forward: Math.max(0.08, forward),
      turn: Math.max(-1, Math.min(1, left - right + (this.lastSensor.wind - 0.25) * 0.2)),
      wingLift: Math.min(1, reactive),
      gait: Math.min(1, forward + reactive * 0.3),
      provenance: "MODELLED MAPPING",
    };
  }

  private runDemoSchedule(): void {
    const phase = this.simTime % 16;
    this.arena.apply("food", phase < 9 ? 0.92 : 0.24);
    this.arena.apply("light", phase < 5 ? 0.75 : 0.38);
    this.arena.apply("wind", phase > 10 && phase < 13 ? 0.9 : 0.14);
    if (phase > 13.6 && phase < 13.8) this.arena.apply("touch", 0.85);
  }

  private reset(): void {
    this.simTime = 0;
    this.accumulator = 0;
    this.spikes = 0;
    this.active = 0;
    this.timeline.fill(0);
    this.neural.reset();
    this.fly.reset();
    this.demo = false;
  }

  private emit(): void {
    const snapshot = this.snapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  private snapshot(): SimulationSnapshot {
    const averageRate = this.neural.cpu.firingRate.reduce((sum, value) => sum + value, 0) / this.fixture.neuronCount;
    const behavior = this.lastSensor.wind > 0.65 || this.lastSensor.touch > 0.5
      ? "BRACING"
      : this.lastSensor.food > 0.28 ? "FORAGING" : this.lastSensor.leftCue + this.lastSensor.rightCue > 0.1 ? "ORIENTING" : "IDLE";
    return {
      timeSeconds: this.simTime,
      paused: this.paused,
      backend: this.neural.status,
      neuronCount: this.fixture.neuronCount,
      synapseCount: this.fixture.synapseCount,
      activeNeurons: this.active,
      spikeCount: this.spikes,
      averageRate,
      fps: this.fps,
      memoryEstimateMiB: estimateColumnMemoryMiB(this.fixture.synapseCount),
      sensor: this.lastSensor,
      motor: this.lastMotor,
      behavior,
      neuronActivity: this.neural.cpu.firingRate,
      timeline: this.timeline,
    };
  }
}
