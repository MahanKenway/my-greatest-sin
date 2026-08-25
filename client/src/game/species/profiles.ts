/** Luminous Connectome Lab: species presentation metadata; data packs remain independently verified. */
import type { SpeciesId, SpeciesProfile } from "@/game/shared/types";

export const SPECIES_PROFILES: Record<SpeciesId, SpeciesProfile> = {
  DROSOPHILA: {
    id: "DROSOPHILA",
    displayName: "DROSOPHILA MELANOGASTER",
    commonName: "FRUIT FLY",
    bodyLabel: "NEUROMECHFLY DROSOPHILA BODY · MODELLED MAPPING",
    sourceLabel: "Apache-2.0 NeuroMechFly source geometry and rest-pose joints; motion is modelled mapping",
    sourceLicense: "Apache-2.0",
    sourceUrl: "https://github.com/NeLy-EPFL/NeuroMechFly",
  },
  C_ELEGANS: {
    id: "C_ELEGANS",
    displayName: "CAENORHABDITIS ELEGANS",
    commonName: "ROUNDWORM",
    bodyLabel: "WORMBASE C. ELEGANS CUTICLE BODY · MODELLED MAPPING",
    sourceLabel: "MIT WormBase Virtual Worm Cuticle surface; body wave is modelled mapping",
    sourceLicense: "MIT",
    sourceUrl: "http://caltech.wormbase.org/virtualworm/",
  },
};
