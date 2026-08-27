import { describe, expect, it } from "vitest";
import { commandForSimulationShortcut } from "./simulationShortcuts";

describe("simulation keyboard shortcuts", () => {
  it("maps each documented shortcut to an existing explicit command", () => {
    expect(commandForSimulationShortcut("Space")).toEqual({ type: "toggle" });
    expect(commandForSimulationShortcut("Digit1")).toEqual({ type: "species", species: "DROSOPHILA" });
    expect(commandForSimulationShortcut("Digit2")).toEqual({ type: "species", species: "C_ELEGANS" });
    expect(commandForSimulationShortcut("KeyR")).toEqual({ type: "reset" });
    expect(commandForSimulationShortcut("KeyD")).toEqual({ type: "demo" });
  });

  it("does not turn unrelated keys into hidden simulation actions", () => {
    expect(commandForSimulationShortcut("KeyW")).toBeNull();
  });
});
