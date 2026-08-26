/** Luminous Connectome Lab: motor decoding never invents a body command; C. elegans B-motor activity is the only forward source. */
import { describe, expect, it } from "vitest";
import { decodeMotorFrame } from "./motorDecoder";
import type { NeuralRouting } from "@/game/shared/types";

const routing: NeuralRouting = {
  sensory: { food: [], leftCue: [], rightCue: [], reactive: [] },
  motor: { forward: [0, 1], dorsalForward: [0], ventralForward: [1], left: [2], right: [3], reactive: [] },
};

describe("network-first C. elegans motor decoder", () => {
  it("keeps the body fully still when all source motor groups are inactive", () => {
    expect(decodeMotorFrame("C_ELEGANS", routing, new Float32Array(4))).toMatchObject({ forward: 0, turn: 0, gait: 0, wingLift: 0 });
  });

  it("turns and advances only from active DB/VB source motor groups", () => {
    const rates = new Float32Array([0.16, 0.08, 1, 0]);
    const motor = decodeMotorFrame("C_ELEGANS", routing, rates);
    expect(motor.forward).toBeGreaterThan(0);
    expect(motor.gait).toBeGreaterThan(0);
    expect(motor.turn).toBeGreaterThan(0);
  });
});
