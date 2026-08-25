/** Luminous Connectome Lab: ensure species presentation cannot lose its explicit source and licence context. */
import { describe, expect, it } from "vitest";
import { SPECIES_PROFILES } from "./profiles";

describe("dual-species profiles", () => {
  it("keeps separate documented body references for fly and worm", () => {
    expect(SPECIES_PROFILES.DROSOPHILA.sourceLicense).toBe("CC BY 4.0");
    expect(SPECIES_PROFILES.DROSOPHILA.sourceUrl).toContain("sketchfab.com");
    expect(SPECIES_PROFILES.C_ELEGANS.sourceLicense).toBe("CC BY 4.0");
    expect(SPECIES_PROFILES.C_ELEGANS.sourceUrl).toContain("sketchfab.com");
  });

  it("describes only presentation bodies, not asserted source connectomes", () => {
    expect(SPECIES_PROFILES.DROSOPHILA.bodyLabel).toContain("BODY");
    expect(SPECIES_PROFILES.C_ELEGANS.bodyLabel).toContain("BODY");
  });
});
