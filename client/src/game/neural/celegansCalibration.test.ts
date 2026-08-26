/** Luminous Connectome Lab: calibration constants are display-scale bounds, never autonomous motor drive. */
import { describe, expect, it } from "vitest";
import { CELEGANS_DECODER_CALIBRATION } from "./celegansCalibration";

describe("C. elegans display calibration", () => {
  it("keeps published crawling reference and continuous-curve cap explicit and bounded", () => {
    expect(CELEGANS_DECODER_CALIBRATION.referenceCrawlSpeedMmPerSec).toBeCloseTo(0.3, 5);
    expect(CELEGANS_DECODER_CALIBRATION.gardenStrideUnitsPerSecondAtFullDrive).toBeCloseTo(0.3, 5);
    expect(CELEGANS_DECODER_CALIBRATION.continuousCurveRadiansPerSecondAtFullDrive).toBeGreaterThan(0);
    expect(CELEGANS_DECODER_CALIBRATION.continuousCurveRadiansPerSecondAtFullDrive).toBeLessThan(1);
    expect(CELEGANS_DECODER_CALIBRATION.sourceUrls).toHaveLength(3);
  });
});
