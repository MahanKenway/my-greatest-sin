/** Luminous Connectome Lab: framework-independent owner for fixed-step environment → sensors → neural engine → body loop. */
import type { Scene } from "@babylonjs/core/scene";
import { loadCElegansRuntime } from "@/game/connectome/celegansRuntime";
import { createStagedFlywireColumns, stagedFlywireExecution } from "@/game/connectome/stagedFlywire";
import { estimateColumnMemoryMiB } from "@/game/connectome/manifest";
import { FlyBody } from "@/game/body/FlyBody";
import { WormBody } from "@/game/body/WormBody";
import type { BodyController } from "@/game/body/types";
import { Arena } from "@/game/environment/Arena";
import { NeuralEngine } from "@/game/neural/engine";
import { SPECIES_PROFILES } from "@/game/species/profiles";
import type { ConnectomeColumns, ConnectomeExecution, MotorFrame, NeuralRouting, SensorFrame, SimulationCommand, SimulationSnapshot, SpeciesId } from "@/game/shared/types";
import { BrainView } from "@/game/visualization/BrainView";

const DT = 0.005;

export class GameWorld {
  private readonly stagedFlywire = createStagedFlywireColumns();
  private readonly arena: Arena;
  private activeConnectome: ConnectomeColumns;
  private neural: NeuralEngine;
  private readonly fly: FlyBody;
  private readonly worm: WormBody;
  private activeBody: BodyController;
  private brain: BrainView;
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
  private species: SpeciesId = "DROSOPHILA";
  private celegansActivation: Promise<void> | null = null;
  private connectomeExecution: ConnectomeExecution = stagedFlywireExecution();
  private lastSensor: SensorFrame = { food: 0, odor: 0, light: 0, leftCue: 0, rightCue: 0, wind: 0, touch: 0, temperature: 0, taste: 0, provenance: "MODELLED MAPPING" };
  private lastMotor: MotorFrame = { forward: 0, turn: 0, wingLift: 0, gait: 0, provenance: "MODELLED MAPPING" };

  constructor(private readonly scene: Scene) {
    this.arena = new Arena(scene);
    this.neural = new NeuralEngine(this.stagedFlywire);
    this.activeConnectome = this.stagedFlywire;
    this.fly = new FlyBody(scene);
    this.worm = new WormBody(scene);
    this.worm.setEnabled(false);
    this.activeBody = this.fly;
    this.brain = new BrainView(scene, this.stagedFlywire);
  }

  update(renderDt: number): void {
    this.elapsed += renderDt;
    this.arena.updatePresentation(this.elapsed);
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
    if (command.type === "environment") this.arena.setPresentation(command.setting, command.amount);
    if (command.type === "species") this.selectSpecies(command.species);
    this.emit();
  }

  subscribe(listener: (snapshot: SimulationSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  dispose(): void {
    this.listeners.clear();
    this.brain.dispose();
  }

  private step(dt: number): void {
    this.simTime += dt;
    if (this.demo) this.runDemoSchedule();
    this.lastSensor = this.arena.sample(this.activeBody.getPosition(), this.activeBody.getHeading(), dt);
    if (this.species === "DROSOPHILA") {
      this.spikes = 0;
      this.active = 0;
      this.lastMotor = {
        forward: 0.12,
        turn: Math.sin(this.simTime * 0.42) * 0.11,
        wingLift: 0.76,
        gait: 0.44,
        provenance: "MODELLED MAPPING",
      };
      this.activeBody.update(this.lastMotor, dt);
      this.timeline.copyWithin(0, 1);
      this.timeline[this.timeline.length - 1] = 0;
      return;
    }
    this.spikes = this.neural.step(dt, this.lastSensor);
    this.lastMotor = this.decodeMotor();
    this.activeBody.update(this.lastMotor, dt);
    this.timeline.copyWithin(0, 1);
    this.timeline[this.timeline.length - 1] = Math.min(1, this.spikes / Math.max(18, this.activeConnectome.neuronCount * 0.12));
    this.active = 0;
    for (let neuron = 0; neuron < this.neural.cpu.firingRate.length; neuron += 1) {
      if (this.neural.cpu.firingRate[neuron] > 0.035) this.active += 1;
    }
  }

  private decodeMotor(): MotorFrame {
    const mean = (indices: ReadonlyArray<number>) => {
      let value = 0;
      for (const index of indices) value += this.neural.cpu.firingRate[index] ?? 0;
      return indices.length ? value / indices.length : 0;
    };
    const forward = Math.min(1, mean(this.neural.routing.motor.forward) * 8.8);
    const left = mean(this.neural.routing.motor.left) * 10;
    const right = mean(this.neural.routing.motor.right) * 10;
    const reactive = mean(this.neural.routing.motor.reactive) * 8;
    const bodyWave = Math.min(1, forward + reactive * 0.3);
    return {
      forward: Math.max(0.08, forward),
      turn: Math.max(-1, Math.min(1, left - right + (this.lastSensor.wind - 0.25) * 0.2)),
      wingLift: this.species === "DROSOPHILA" ? Math.min(1, reactive) : bodyWave,
      gait: bodyWave,
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
    this.worm.reset();
    this.demo = false;
  }

  private emit(): void {
    const snapshot = this.snapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  private snapshot(): SimulationSnapshot {
    const averageRate = this.neural.cpu.firingRate.reduce((sum, value) => sum + value, 0) / Math.max(1, this.activeConnectome.neuronCount);
    const behavior = this.lastSensor.wind > 0.65 || this.lastSensor.touch > 0.5
      ? "BRACING"
      : this.lastSensor.food > 0.28 ? "FORAGING" : this.lastSensor.leftCue + this.lastSensor.rightCue > 0.1 ? "ORIENTING" : "IDLE";
    return {
      timeSeconds: this.simTime,
      paused: this.paused,
      backend: this.neural.status,
      neuronCount: this.activeConnectome.neuronCount,
      synapseCount: this.activeConnectome.synapseCount,
      activeNeurons: this.active,
      spikeCount: this.spikes,
      averageRate,
      fps: this.fps,
      memoryEstimateMiB: estimateColumnMemoryMiB(this.activeConnectome.synapseCount),
      connectomeExecution: this.connectomeExecution,
      species: SPECIES_PROFILES[this.species],
      sensor: this.lastSensor,
      motor: this.lastMotor,
      environment: this.arena.getPresentation(),
      behavior,
      neuronActivity: this.neural.cpu.firingRate,
      timeline: this.timeline,
    };
  }

  private selectSpecies(species: SpeciesId): void {
    if (this.species === species) return;
    this.species = species;
    const flyActive = species === "DROSOPHILA";
    this.fly.setEnabled(flyActive);
    this.worm.setEnabled(!flyActive);
    this.activeBody = flyActive ? this.fly : this.worm;
    this.brain.setVisible(flyActive);
    if (flyActive) this.activateStagedFlywire();
    else void this.activateCElegans();
  }

  private activateStagedFlywire(): void {
    if (this.activeConnectome === this.stagedFlywire) {
      this.connectomeExecution = stagedFlywireExecution();
      return;
    }
    this.installConnectome(this.stagedFlywire, undefined, stagedFlywireExecution());
  }

  private async activateCElegans(): Promise<void> {
    if (this.activeConnectome.provenance === "SOURCE DATA" || this.celegansActivation) return;
    this.connectomeExecution = {
      topology: "MODELLED MAPPING",
      label: "C. ELEGANS PACK LOADING",
      detail: "No synthetic fly network is active while the cited C. elegans manifest and five source chunks are checksum-verified.",
    };
    this.celegansActivation = loadCElegansRuntime()
      .then((runtime) => {
        if (this.species === "C_ELEGANS") this.installConnectome(runtime.columns, runtime.routing, runtime.execution);
      })
      .catch((error: unknown) => {
        this.connectomeExecution = {
          topology: "MODELLED MAPPING",
          label: "C. ELEGANS PACK ERROR",
          detail: error instanceof Error ? error.message : "The C. elegans source pack could not be activated; no synthetic fallback is active.",
        };
      })
      .finally(() => {
        this.celegansActivation = null;
        this.emit();
      });
    await this.celegansActivation;
  }

  private installConnectome(columns: ConnectomeColumns, routing: NeuralRouting | undefined, execution: ConnectomeExecution): void {
    this.activeConnectome = columns;
    this.neural = new NeuralEngine(columns, routing);
    this.brain.dispose();
    this.brain = new BrainView(this.scene, columns);
    this.brain.setVisible(this.species === "DROSOPHILA");
    this.connectomeExecution = execution;
    this.reset();
  }

}
