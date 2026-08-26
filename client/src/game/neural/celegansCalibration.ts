/** Luminous Connectome Lab: published crawling observations set display-scale bounds; this is not a biomechanical validation. */
export const CELEGANS_DECODER_CALIBRATION = {
  /** Rabets et al. 2014 report u ≈ 300 μm/s for crawling on wet agar. */
  referenceCrawlSpeedMmPerSec: 0.3,
  /** Garden units are presentation units, not millimetres; this is a visual-scale cap only. */
  gardenStrideUnitsPerSecondAtFullDrive: 0.3,
  /** Continuous curves stay visibly distinct from the abrupt turns/reorientations separated by Stephens et al. 2010. */
  continuousCurveRadiansPerSecondAtFullDrive: 0.45,
  sourceUrls: [
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC4213666/",
    "https://doi.org/10.1371/journal.pone.0002550",
    "https://doi.org/10.1371/journal.pone.0013914",
  ],
} as const;
