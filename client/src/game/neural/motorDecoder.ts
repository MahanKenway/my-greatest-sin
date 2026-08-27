/** Luminous Connectome Lab: MODELLED decoder reads only source-runtime motor-group activity; it supplies no navigation policy or baseline drive. */
import type { DecoderReadoutIntervention, MotorFrame, NeuralRouting, SpeciesId } from "@/game/shared/types";

export type CElegansMotorActivity = { dorsalDB: number; ventralVB: number };

const meanRate = (rates: Float32Array, indices: ReadonlyArray<number> | undefined): number => {
  if (!indices?.length) return 0;
  let value = 0;
  for (const index of indices) value += rates[index] ?? 0;
  return value / indices.length;
};

export function readCElegansMotorActivity(routing: NeuralRouting, firingRate: Float32Array): CElegansMotorActivity {
  return {
    dorsalDB: meanRate(firingRate, routing.motor.dorsalForward),
    ventralVB: meanRate(firingRate, routing.motor.ventralForward),
  };
}

function maskedForwardMean(routing: NeuralRouting, firingRate: Float32Array, intervention: DecoderReadoutIntervention): number {
  const db = new Set(routing.motor.dorsalForward ?? []);
  const vb = new Set(routing.motor.ventralForward ?? []);
  const retained = (routing.motor.forward ?? []).filter((index) =>
    (intervention !== "MASK_DB" || !db.has(index)) && (intervention !== "MASK_VB" || !vb.has(index)),
  );
  return meanRate(firingRate, retained);
}

export function decodeMotorFrame(species: SpeciesId, routing: NeuralRouting, firingRate: Float32Array, intervention: DecoderReadoutIntervention = "NONE"): MotorFrame {
  const rawForward = species === "C_ELEGANS" ? maskedForwardMean(routing, firingRate, intervention) : meanRate(firingRate, routing.motor.forward);
  const sourceForward = Math.min(1, rawForward * 8.8);
  const { dorsalDB, ventralVB } = readCElegansMotorActivity(routing, firingRate);
  const dorsalForward = intervention === "MASK_DB" ? 0 : dorsalDB;
  const ventralForward = intervention === "MASK_VB" ? 0 : ventralVB;
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
