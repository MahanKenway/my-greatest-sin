/**
 * C. elegans navigation is a disclosed MODELLED MAPPING layered after source-topology decoding.
 * It never changes source columns, neural routing, or the FlyWire-staged fly path.
 */
export type WormNavigationMode = "IDLE" | "SEEKING FOOD" | "AVOIDING OBSTACLE" | "FEEDING";

export type WormNavigationInput = Readonly<{
  positionX: number;
  positionZ: number;
  heading: number;
  foodX: number;
  foodZ: number;
  foodSignal: number;
  obstacleX: number;
  obstacleZ: number;
  obstacleRadius: number;
}>;

export type WormNavigationResult = Readonly<{
  mode: WormNavigationMode;
  foodDistance: number;
  obstacleClearance: number;
  turnBias: number;
  speedScale: number;
}>;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function shortestAngle(target: number, current: number): number {
  let difference = target - current;
  while (difference > Math.PI) difference -= Math.PI * 2;
  while (difference < -Math.PI) difference += Math.PI * 2;
  return difference;
}

export function navigateWorm(input: WormNavigationInput): WormNavigationResult {
  const foodDx = input.foodX - input.positionX;
  const foodDz = input.foodZ - input.positionZ;
  const foodDistance = Math.hypot(foodDx, foodDz);
  const obstacleDx = input.positionX - input.obstacleX;
  const obstacleDz = input.positionZ - input.obstacleZ;
  const obstacleDistance = Math.hypot(obstacleDx, obstacleDz);
  const obstacleClearance = obstacleDistance - input.obstacleRadius;

  if (obstacleClearance < 0.86) {
    const awayHeading = obstacleDistance > 0.0001
      ? Math.atan2(obstacleDz, obstacleDx)
      : input.heading + Math.PI / 2;
    return {
      mode: "AVOIDING OBSTACLE",
      foodDistance,
      obstacleClearance,
      turnBias: clamp(shortestAngle(awayHeading, input.heading) * 1.35, -1, 1),
      speedScale: clamp(0.28 + Math.max(0, obstacleClearance) * 0.46, 0.2, 0.66),
    };
  }

  if (foodDistance < 0.48 && input.foodSignal > 0.12) {
    return { mode: "FEEDING", foodDistance, obstacleClearance, turnBias: 0, speedScale: 0.12 };
  }

  if (input.foodSignal > 0.1) {
    const foodHeading = Math.atan2(foodDz, foodDx);
    return {
      mode: "SEEKING FOOD",
      foodDistance,
      obstacleClearance,
      turnBias: clamp(shortestAngle(foodHeading, input.heading) * 0.46, -0.72, 0.72),
      speedScale: 0.78,
    };
  }

  return { mode: "IDLE", foodDistance, obstacleClearance, turnBias: 0, speedScale: 0.44 };
}
