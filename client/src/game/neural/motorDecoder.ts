/** Luminous Connectome Lab: MODELLED decoder reads only source-runtime motor-group activity; it supplies no navigation policy or baseline drive. */
import type { MotorFrame, NeuralRouting, SpeciesId } from "@/game/shared/types";

const meanRate = (rates: Float32Array, indices: ReadonlyArray<number> | undefined): number => {
  if (!indices?.length) return 0;
  let value = 0;
  for (const index of indices) value += rates[index] ?? 0;
  return value / indices.length;
};

export function decodeMotorFrame(species: SpeciesId, routing: NeuralRouting, firingRate: Float32Array): MotorFrame {
  const sourceForward = Math.min(1, meanRate(firingRate, routing.motor.forward) * 8.8);
  const dorsalForward = meanRate(firingRate, routing.motor.dorsalForward);
  const ventralForward = meanRate(firingRate, routing.motor.ventralForward);
  const fallbackTurn = (meanRate(firingRate, routing.motor.left) - meanRate(firingRate, routing.motor.right)) * 10;
  const sourceTurn = species === "C_ELEGANS" && (routing.motor.dorsalForward?.length || routing.motor.ventralForward?.length)
    ? (dorsalForward - ventralForward) * 12
    : fallbackTurn;
  const reactive = meanRate(firingRate, routing.motor.reactive) * 8;
  const bodyWave = Math.min(1, sourceForward + reactive * 0.3);
  return {
    forward: sourceForward,
    turn: Math.max(-1, Math.min(1, sourceTurn)),
    wingLift: species === "DROSOPHILA" ? Math.min(1, reactive) : bodyWave,
    gait: bodyWave,
    provenance: "MODELLED MAPPING",
  };
}
