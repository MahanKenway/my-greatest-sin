/** Luminous Connectome Lab: species presentation metadata; data packs remain independently verified. */
import type { SpeciesId, SpeciesProfile } from "@/game/shared/types";

export const SPECIES_PROFILES: Record<SpeciesId, SpeciesProfile> = {
  DROSOPHILA: {
    id: "DROSOPHILA",
    displayName: "DROSOPHILA MELANOGASTER",
    commonName: "FRUIT FLY",
    bodyLabel: "SIX-LEGGED FLY BODY",
    sourceLabel: "NeuroMechFly reference body components",
    sourceLicense: "Apache-2.0",
    sourceUrl: "https://github.com/NeLy-EPFL/NeuroMechFly",
  },
  C_ELEGANS: {
    id: "C_ELEGANS",
    displayName: "CAENORHABDITIS ELEGANS",
    commonName: "ROUNDWORM",
    bodyLabel: "SEGMENTED WORM BODY",
    sourceLabel: "OpenWorm Virtual Worm anatomy reference",
    sourceLicense: "MIT",
    sourceUrl: "https://github.com/openworm/wormbrowser",
  },
};
