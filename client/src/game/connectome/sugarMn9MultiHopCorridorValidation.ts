/**
 * Luminous Connectome Lab: immutable display record for the external v783
 * four-hop structural corridor run. It is not imported by GameWorld or FlyBody.
 */
export const SUGAR_MN9_MULTIHOP_CORRIDOR_VALIDATION = {
  status: "OFFLINE FOUR-HOP CORRIDOR" as const,
  interpretation: "STRUCTURAL MODEL RESPONSE" as const,
  nodeCount: 1115,
  edgeCount: 13346,
  minimumSynapsesPerConnection: 3,
  maximumPathLength: 4,
  inputRootsPresent: 20,
  trialsPerCondition: 30,
  ratesHz: [0, 25, 50, 100, 150, 200] as const,
  baselineMn9RatesHz: [0, 62.3, 117.2, 154.4, 176.2, 190.6] as const,
  ablatedMn9RatesHz: [0, 0, 0, 0, 0, 0] as const,
  boundary: "This offline structural corridor uses modelled Poisson input and Forward-Euler LIF. It is not full FlyWire execution, an animal measurement, or a FlyBody command.",
} as const;
