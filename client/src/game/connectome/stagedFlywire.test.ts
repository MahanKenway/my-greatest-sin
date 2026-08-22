/** Luminous Connectome Lab: Drosophila must never silently fall back to a small synthetic network. */
import { describe, expect, it } from "vitest";
import { createStagedFlywireColumns, stagedFlywireExecution } from "./stagedFlywire";

describe("staged FlyWire placeholder", () => {
  it("contains no substitute neurons or edges", () => {
    const columns = createStagedFlywireColumns();
    expect(columns.neuronCount).toBe(0);
    expect(columns.synapseCount).toBe(0);
    expect(columns.incomingOffsets).toEqual(new Uint32Array([0]));
  });

  it("names the execution boundary explicitly", () => {
    expect(stagedFlywireExecution().detail).toContain("No 96-neuron fallback");
  });
});
