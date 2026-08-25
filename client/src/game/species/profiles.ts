/** Luminous Connectome Lab: species presentation metadata; data packs remain independently verified. */
import type { SpeciesId, SpeciesProfile } from "@/game/shared/types";

export const SPECIES_PROFILES: Record<SpeciesId, SpeciesProfile> = {
  DROSOPHILA: {
    id: "DROSOPHILA",
    displayName: "DROSOPHILA MELANOGASTER",
    commonName: "FRUIT FLY",
    bodyLabel: "WILDTYPE FEMALE FLY GLB BODY",
    sourceLabel: "Wildtype female Drosophila presentation model",
    sourceLicense: "CC BY 4.0",
    sourceUrl: "https://sketchfab.com/3d-models/wildtype-female-drosophila-melanogaster-3ba1adba62f34fe995413ee5e9cf3c25",
  },
  C_ELEGANS: {
    id: "C_ELEGANS",
    displayName: "CAENORHABDITIS ELEGANS",
    commonName: "ROUNDWORM",
    bodyLabel: "C. ELEGANS MODELLED CONTOUR BODY",
    sourceLabel: "Contour reference from C. elegans model by Miguelangelo Rosario",
    sourceLicense: "CC BY 4.0",
    sourceUrl: "https://sketchfab.com/3d-models/caenorhabditis-elegans-d0591813159a4e8691994f8df58c128d",
  },
};
