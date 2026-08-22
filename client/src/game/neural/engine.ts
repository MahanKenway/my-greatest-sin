/** Luminous Connectome Lab: transparent backend selection; fixture execution remains on the deterministic fallback. */
import type { ConnectomeColumns, NeuralRouting, SensorFrame } from "@/game/shared/types";
import { FIXTURE_ROUTING, TypedArrayLifEngine } from "./lifCpu";

type NavigatorGpu = Navigator & { gpu?: unknown };

export class NeuralEngine {
  readonly cpu: TypedArrayLifEngine;
  readonly routing: NeuralRouting;
  readonly status: "CPU TypedArray" | "WebGPU available — sparse kernel staged" | "WebGPU unavailable";

  constructor(columns: ConnectomeColumns, routing?: NeuralRouting) {
    this.routing = routing ?? FIXTURE_ROUTING;
    this.cpu = new TypedArrayLifEngine(columns, this.routing);
    this.status = typeof navigator !== "undefined" && "gpu" in (navigator as NavigatorGpu)
      ? "WebGPU available — sparse kernel staged"
      : "WebGPU unavailable";
  }

  step(dt: number, sensor: SensorFrame): number {
    const reactive = Math.min(1.5, sensor.wind + sensor.touch + Math.abs(sensor.temperature) * 0.3);
    this.cpu.setSensoryInput(sensor.odor + sensor.taste, sensor.leftCue, sensor.rightCue, reactive);
    return this.cpu.step(dt);
  }

  reset(): void {
    this.cpu.reset();
  }
}
