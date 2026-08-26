/**
 * Luminous Connectome Lab: immutable record of the external offline subgraph
 * run. It is evidence display only; no GameWorld or FlyBody path imports it.
 */
export const SUGAR_MN9_OFFLINE_VALIDATION = {
  status: "OFFLINE SUBGRAPH VALIDATION" as const,
  interpretation: "LIMITED NEGATIVE" as const,
  nodeCount: 33,
  edgeCount: 67,
  stimulatedSugarRootsInObservedPaths: 19,
  mn9RootId: "720575940660219265",
  ratesHz: [0, 25, 50, 100, 150, 200] as const,
  trialsPerCondition: 30,
  baselineMn9RatesHz: [0, 0, 0, 0, 0, 0] as const,
  ablatedMn9RatesHz: [0, 0, 0, 0, 0, 0] as const,
  siteLevelSigns: { excitatory: 94640, inhibitory: 44011, unclassified: 604 },
  boundary: "The official two-hop subgraph was insufficient under this offline approximation. This is not a full-FlyWire, WebGPU, behavioural, or body-control result.",
} as const;
