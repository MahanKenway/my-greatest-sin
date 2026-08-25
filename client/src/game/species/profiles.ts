/** Luminous Connectome Lab: species presentation metadata; data packs remain independently verified. */
import type { SpeciesId, SpeciesProfile } from "@/game/shared/types";

export const SPECIES_PROFILES: Record<SpeciesId, SpeciesProfile> = {
  DROSOPHILA: {
    id: "DROSOPHILA",
    displayName: "DROSOPHILA MELANOGASTER",
    commonName: "FRUIT FLY",
    bodyLabel: "FLYBODY DROSOPHILA BODY · MODELLED MAPPING",
    sourceLabel: "Apache-2.0 FlyBody source geometry and published rest-pose joints; motion is modelled mapping",
    sourceLicense: "Apache-2.0",
    sourceUrl: "https://github.com/TuragaLab/flybody",
  },
  C_ELEGANS: {
    id: "C_ELEGANS",
    displayName: "CAENORHABDITIS ELEGANS",
    commonName: "ROUNDWORM",
    bodyLabel: "C. ELEGANS CONTINUOUS BODY · MODELLED MAPPING",
    sourceLabel: "Handcrafted presentation surface; travelling body wave is modelled mapping",
    sourceLicense: "MODELLED MAPPING",
    sourceUrl: "https://github.com/MahanKenway/digital-fly",
  },
};
