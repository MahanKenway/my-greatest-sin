import { describe, expect, it } from "vitest";
import { WormNavigator, type WormNavigationInput } from "./WormNavigator";

const input = (overrides: Partial<WormNavigationInput> = {}): WormNavigationInput => ({
  timeSeconds: 0,
  positionX: 0,
  positionZ: 0,
  heading: 0,
  foodTargets: [
    { id: "lawn", label: "BACTERIAL LAWN", x: 3, z: 0, value: 1, signal: 0.72 },
    { id: "yeast", label: "YEAST FLAKE", x: 1.4, z: 2.5, value: 0.56, signal: 0.72 },
  ],
  obstacleX: -4,
  obstacleZ: -4,
  obstacleRadius: 0.5,
  ...overrides,
});

describe("WormNavigator", () => {
  it("chooses the higher-value available food target", () => {
    const result = new WormNavigator().update(input());
    expect(result.mode).toBe("SEEKING FOOD");
    expect(result.targetLabel).toBe("BACTERIAL LAWN");
    expect(result.targetValue).toBe(1);
  });

  it("prioritizes bounded obstacle avoidance before food seeking", () => {
    const result = new WormNavigator().update(input({ obstacleX: 0.45, obstacleZ: 0 }));
    expect(result.mode).toBe("AVOIDING OBSTACLE");
    expect(Math.abs(result.turnBias)).toBeGreaterThan(0.2);
    expect(result.speedScale).toBeLessThan(0.6);
  });

  it("rests after feeding and temporarily avoids the visited target", () => {
    const navigator = new WormNavigator();
    const feeding = navigator.update(input({ positionX: 2.72, timeSeconds: 1 }));
    expect(feeding.mode).toBe("FEEDING");
    const resting = navigator.update(input({ positionX: 2.72, timeSeconds: 1.1 }));
    expect(resting.mode).toBe("RESTING");
    const nextTarget = navigator.update(input({ positionX: 0, timeSeconds: 3.2 }));
    expect(nextTarget.targetLabel).toBe("YEAST FLAKE");
  });

  it("uses deterministic controlled exploration only with no food field", () => {
    const navigator = new WormNavigator();
    const first = navigator.update(input({ foodTargets: [], timeSeconds: 4 }));
    const second = navigator.update(input({ foodTargets: [], timeSeconds: 4 }));
    expect(first.mode).toBe("EXPLORING");
    expect(first.turnBias).toBe(second.turnBias);
    expect(first.speedScale).toBeGreaterThan(0);
  });
});
