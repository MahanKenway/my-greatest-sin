/** Luminous Connectome Lab: ensure species presentation cannot lose its explicit source and licence context. */
import { describe, expect, it } from "vitest";
import { SPECIES_PROFILES } from "./profiles";

describe("dual-species profiles", () => {
  it("keeps separate documented body references for fly and worm", () => {
    expect(SPECIES_PROFILES.DROSOPHILA.sourceLicense).toBe("Apache-2.0");
    expect(SPECIES_PROFILES.DROSOPHILA.sourceUrl).toContain("TuragaLab/flybody");
    expect(SPECIES_PROFILES.C_ELEGANS.sourceLicense).toBe("MODELLED MAPPING");
    expect(SPECIES_PROFILES.C_ELEGANS.sourceLabel).toContain("Handcrafted");
  });

  it("describes only presentation bodies, not asserted source connectomes", () => {
    expect(SPECIES_PROFILES.DROSOPHILA.bodyLabel).toContain("BODY");
    expect(SPECIES_PROFILES.C_ELEGANS.bodyLabel).toContain("BODY");
  });
});
