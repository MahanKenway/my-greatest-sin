/** Luminous Connectome Lab: common causal body surface; never represents an actual living organism. */
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { MotorFrame } from "@/game/shared/types";

export type BodyController = {
  update: (motor: MotorFrame, dt: number) => void;
  getPosition: () => Vector3;
  getHeading: () => number;
  reset: () => void;
  setEnabled: (enabled: boolean) => void;
};
