/** Luminous Connectome Lab: transparent backend selection; fixture execution remains on the deterministic fallback. */
import type { ConnectomeColumns, SensorFrame } from "@/game/shared/types";
import { TypedArrayLifEngine } from "./lifCpu";

type NavigatorGpu = Navigator & { gpu?: unknown };

export class NeuralEngine {
  readonly cpu: TypedArrayLifEngine;
  readonly status: "CPU TypedArray" | "WebGPU available — sparse kernel staged" | "WebGPU unavailable";

  constructor(columns: ConnectomeColumns) {
    this.cpu = new TypedArrayLifEngine(columns);
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
