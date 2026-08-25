/**
 * Luminous Connectome Lab: published root-ID contract for an evidence-only pilot.
 * IDs are strings because FlyWire root IDs exceed JavaScript Number precision.
 */
export const SUGAR_MN9_PILOT = {
  id: "sugar-grn-to-mn9-v783-pilot",
  label: "SUGAR-GRN → MN9 / PROBOSCIS PILOT",
  sourceStatus: "SOURCE DATA" as const,
  inputRootIds: [
    "720575940624963786", "720575940630233916", "720575940637568838", "720575940638202345", "720575940617000768",
    "720575940630797113", "720575940632889389", "720575940621754367", "720575940621502051", "720575940640649691",
    "720575940639332736", "720575940616885538", "720575940639198653", "720575940620900446", "720575940617937543",
    "720575940632425919", "720575940633143833", "720575940612670570", "720575940628853239", "720575940629176663",
    "720575940611875570",
  ],
  outputRootId: "720575940660219265",
  inputMapping: "MODELLED SENSOR INPUT: food/odor slider to sugar-GRN firing-rate encoding.",
  outputMapping: "MODELLED MOTOR DECODER: MN9 readout to a future proboscis-only visual rig; not walking or wing control.",
  evidence: "Shiu et al. (2024) report labellar sugar-GRN stimulation and MN9 readout in a FlyWire-based computational brain model.",
} as const;
