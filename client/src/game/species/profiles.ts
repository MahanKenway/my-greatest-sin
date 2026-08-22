/** Luminous Connectome Lab: species presentation metadata; data packs remain independently verified. */
import type { SpeciesId, SpeciesProfile } from "@/game/shared/types";

export const SPECIES_PROFILES: Record<SpeciesId, SpeciesProfile> = {
  DROSOPHILA: {
    id: "DROSOPHILA",
    displayName: "DROSOPHILA MELANOGASTER",
    commonName: "FRUIT FLY",
    bodyLabel: "FULL FLY GLB BODY",
    sourceLabel: "NeuroMechFly Apache-2.0 component assembly",
    sourceLicense: "Apache-2.0",
    sourceUrl: "https://github.com/NeLy-EPFL/NeuroMechFly",
  },
  C_ELEGANS: {
    id: "C_ELEGANS",
    displayName: "CAENORHABDITIS ELEGANS",
    commonName: "ROUNDWORM",
    bodyLabel: "FULL WORM GLB BODY",
    sourceLabel: "OpenWorm-informed MIT presentation mesh",
    sourceLicense: "MIT",
    sourceUrl: "https://github.com/openworm/wormbrowser",
  },
};
