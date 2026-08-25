/**
 * Luminous Connectome Lab: published-rate experimental contract. These records
 * define future GPU runs; they are not measurements until an adapter executes.
 */
import type { SugarMn9InputAblation } from "./sugarMn9Pilot";

export const SUGAR_MN9_RESPONSE_RATES_HZ = [0, 25, 50, 100, 150, 200] as const;

export type SugarMn9ExperimentCondition = {
  id: "baseline" | "input-ablation";
  label: string;
  inputAblation: SugarMn9InputAblation;
  ratesHz: readonly number[];
  interpretation: string;
};

export const SUGAR_MN9_EXPERIMENT_CONDITIONS: readonly SugarMn9ExperimentCondition[] = [
  {
    id: "baseline",
    label: "SUGAR INPUT BASELINE",
    inputAblation: "OPEN",
    ratesHz: SUGAR_MN9_RESPONSE_RATES_HZ,
    interpretation: "Modelled external sugar-GRN injection is available; MN9 output remains a structural score until transmitter-aware LIF validation.",
  },
  {
    id: "input-ablation",
    label: "SUGAR INPUT ABLATED",
    inputAblation: "CLOSED",
    ratesHz: SUGAR_MN9_RESPONSE_RATES_HZ,
    interpretation: "Negative control closes only external injection; it does not claim to silence biological incoming or outgoing synapses.",
  },
];

export const SUGAR_MN9_EXPERIMENT_METADATA = {
  sourceModelTrialDurationMs: 1000,
  sourceModelTrials: 30,
  sourceFigureRateSweepHz: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200] as const,
  runtimeStatus: "PROTOCOL ONLY — NO GPU MEASUREMENT" as const,
} as const;
