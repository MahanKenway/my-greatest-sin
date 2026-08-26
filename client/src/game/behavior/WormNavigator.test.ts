import { describe, expect, it } from "vitest";
import { navigateWorm } from "./WormNavigator";

const base = {
  positionX: 0,
  positionZ: 0,
  heading: 0,
  foodX: 3,
  foodZ: 2,
  foodSignal: 0.6,
  obstacleX: -4,
  obstacleZ: -4,
  obstacleRadius: 0.5,
};

describe("navigateWorm", () => {
  it("adds a bounded turn toward a modelled food target", () => {
    const result = navigateWorm(base);
    expect(result.mode).toBe("SEEKING FOOD");
    expect(result.turnBias).toBeGreaterThan(0);
    expect(result.speedScale).toBe(0.78);
  });

  it("prioritizes avoidance and slows before the forage rock", () => {
    const result = navigateWorm({ ...base, obstacleX: 0.45, obstacleZ: 0, obstacleRadius: 0.5 });
    expect(result.mode).toBe("AVOIDING OBSTACLE");
    expect(Math.abs(result.turnBias)).toBeGreaterThan(0.2);
    expect(result.speedScale).toBeLessThan(0.7);
  });

  it("settles to feeding near the food target only when the field is present", () => {
    const result = navigateWorm({ ...base, positionX: 2.75, positionZ: 1.75 });
    expect(result.mode).toBe("FEEDING");
    expect(result.speedScale).toBeLessThan(0.2);
  });
});
