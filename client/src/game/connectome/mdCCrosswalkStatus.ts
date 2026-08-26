/**
 * Luminous Connectome Lab: immutable scientific gate for the published
 * md-C swallowing hypothesis. No root IDs are exposed or inferred here.
 */
export const MD_C_CROSSWALK_STATUS = {
  label: "MD-C → MN11/MN12",
  status: "BLOCKED: NO VERSION-ALIGNED ROOT CROSSWALK",
  evidence: "Qin et al. define md-C by a Tmc-GAL4 ∩ nompC-QF intersection, not FlyWire root IDs.",
  audit: "Pinned v2.1.0 and current v3.1.0 v783 annotations have zero exact md-C, MN11 or MN12 labels; Codex/CAVE query access requires authenticated access.",
  correctTargets: ["MN11", "MN12"],
  forbiddenSubstitutions: ["broad pharyngeal candidates", "MN9"],
  executionAllowed: false,
} as const;
