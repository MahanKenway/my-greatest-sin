/** Luminous Connectome Lab: 140k FlyWire may only pass through a WebGPU benchmark gate. */
import { describe, expect, it } from "vitest";
import { inspectOfficialFlywireStage } from "./flywireStage";

describe("official FlyWire staged profile", () => {
  it("keeps the 140k pack blocked when WebGPU is absent", () => {
    const stage = inspectOfficialFlywireStage(false);
    expect(stage.state).toBe("WEBGPU_UNAVAILABLE");
    expect(stage.neuronCount).toBe(139_255);
    expect(stage.synapseCount).toBe(16_847_997);
    expect(stage.message).toContain("CPU execution is forbidden");
  });

  it("requires a benchmark even when WebGPU is present", () => {
    expect(inspectOfficialFlywireStage(true).state).toBe("BENCHMARK_REQUIRED");
  });
});
