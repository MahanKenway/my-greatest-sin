/**
 * C. elegans navigation is a disclosed MODELLED MAPPING layered after source-topology decoding.
 * Food choice, route recall and exploration are deterministic session policy, never source-neuron state.
 */
export type WormNavigationMode = "IDLE" | "SEEKING FOOD" | "AVOIDING OBSTACLE" | "FEEDING" | "RESTING" | "EXPLORING";

export type WormFoodTarget = Readonly<{
  id: string;
  label: string;
  x: number;
  z: number;
  value: number;
  signal: number;
}>;

export type WormNavigationInput = Readonly<{
  timeSeconds: number;
  positionX: number;
  positionZ: number;
  heading: number;
  foodTargets: ReadonlyArray<WormFoodTarget>;
  obstacleX: number;
  obstacleZ: number;
  obstacleRadius: number;
}>;

export type WormNavigationResult = Readonly<{
  mode: WormNavigationMode;
  targetLabel: string;
  targetValue: number;
  foodDistance: number;
  obstacleClearance: number;
  turnBias: number;
  speedScale: number;
  memoryAgeSeconds: number;
  memorySlots: number;
}>;

type PathPoint = Readonly<{ x: number; z: number; timeSeconds: number }>;

const MAX_PATH_POINTS = 12;
const MAX_VISITS = 4;
const VISIT_TTL_SECONDS = 7.5;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function shortestAngle(target: number, current: number): number {
  let difference = target - current;
  while (difference > Math.PI) difference -= Math.PI * 2;
  while (difference < -Math.PI) difference += Math.PI * 2;
  return difference;
}

export class WormNavigator {
  private readonly path: PathPoint[] = [];
  private readonly visits = new Map<string, number>();
  private restUntil = 0;
  private lastRecordedTime = -Infinity;

  reset(): void {
    this.path.length = 0;
    this.visits.clear();
    this.restUntil = 0;
    this.lastRecordedTime = -Infinity;
  }

  update(input: WormNavigationInput): WormNavigationResult {
    this.recordPath(input);
    this.pruneVisits(input.timeSeconds);
    const obstacleDx = input.positionX - input.obstacleX;
    const obstacleDz = input.positionZ - input.obstacleZ;
    const obstacleDistance = Math.hypot(obstacleDx, obstacleDz);
    const obstacleClearance = obstacleDistance - input.obstacleRadius;
    const target = this.selectFood(input);
    const foodDistance = target ? Math.hypot(target.x - input.positionX, target.z - input.positionZ) : Infinity;
    const memoryAgeSeconds = target ? Math.max(0, input.timeSeconds - (this.visits.get(target.id) ?? -Infinity)) : Infinity;

    if (obstacleClearance < 0.82) {
      const awayHeading = obstacleDistance > 0.0001 ? Math.atan2(obstacleDz, obstacleDx) : input.heading + Math.PI / 2;
      return this.result("AVOIDING OBSTACLE", target, foodDistance, obstacleClearance, clamp(shortestAngle(awayHeading, input.heading) * 0.72, -0.76, 0.76), clamp(0.22 + Math.max(0, obstacleClearance) * 0.48, 0.18, 0.58), memoryAgeSeconds);
    }

    if (input.timeSeconds < this.restUntil) {
      return this.result("RESTING", target, foodDistance, obstacleClearance, 0, 0, memoryAgeSeconds);
    }

    if (target && target.signal > 0.07) {
      if (foodDistance < 0.46) {
        this.rememberVisit(target.id, input.timeSeconds);
        this.restUntil = input.timeSeconds + 1.45 + target.value * 0.5;
        return this.result("FEEDING", target, foodDistance, obstacleClearance, 0, 0.06, 0);
      }
      const targetHeading = Math.atan2(target.z - input.positionZ, target.x - input.positionX);
      return this.result("SEEKING FOOD", target, foodDistance, obstacleClearance, clamp(shortestAngle(targetHeading, input.heading) * 0.31, -0.42, 0.42), 0.7 + target.value * 0.08, memoryAgeSeconds);
    }

    const explorationHeading = this.explorationHeading(input);
    return this.result("EXPLORING", undefined, Infinity, obstacleClearance, clamp(shortestAngle(explorationHeading, input.heading) * 0.24, -0.28, 0.28), 0.48, Infinity);
  }

  private result(mode: WormNavigationMode, target: WormFoodTarget | undefined, foodDistance: number, obstacleClearance: number, turnBias: number, speedScale: number, memoryAgeSeconds: number): WormNavigationResult {
    return {
      mode,
      targetLabel: target?.label ?? "NO FOOD FIELD",
      targetValue: target?.value ?? 0,
      foodDistance,
      obstacleClearance,
      turnBias,
      speedScale,
      memoryAgeSeconds,
      memorySlots: this.path.length,
    };
  }

  private selectFood(input: WormNavigationInput): WormFoodTarget | undefined {
    let selected: WormFoodTarget | undefined;
    let selectedScore = 0.055;
    for (const target of input.foodTargets) {
      const distance = Math.hypot(target.x - input.positionX, target.z - input.positionZ);
      const age = input.timeSeconds - (this.visits.get(target.id) ?? -Infinity);
      const revisitFactor = Number.isFinite(age) ? clamp(age / VISIT_TTL_SECONDS, 0.05, 1) : 1;
      const score = target.signal * target.value * revisitFactor / (0.72 + distance * 0.16);
      if (score > selectedScore) {
        selected = target;
        selectedScore = score;
      }
    }
    return selected;
  }

  private recordPath(input: WormNavigationInput): void {
    if (input.timeSeconds - this.lastRecordedTime < 0.42) return;
    this.lastRecordedTime = input.timeSeconds;
    this.path.push({ x: input.positionX, z: input.positionZ, timeSeconds: input.timeSeconds });
    if (this.path.length > MAX_PATH_POINTS) this.path.shift();
  }

  private rememberVisit(id: string, timeSeconds: number): void {
    this.visits.set(id, timeSeconds);
    while (this.visits.size > MAX_VISITS) this.visits.delete(this.visits.keys().next().value as string);
  }

  private pruneVisits(timeSeconds: number): void {
    for (const [id, visitedAt] of Array.from(this.visits.entries())) if (timeSeconds - visitedAt > VISIT_TTL_SECONDS) this.visits.delete(id);
  }

  private explorationHeading(input: WormNavigationInput): number {
    if (this.path.length < 3) return input.heading + Math.sin(input.timeSeconds * 0.63 + 0.8) * 0.82;
    const recent = this.path.slice(-6);
    const centroid = recent.reduce((sum, point) => ({ x: sum.x + point.x, z: sum.z + point.z }), { x: 0, z: 0 });
    const away = Math.atan2(input.positionZ - centroid.z, input.positionX - centroid.x);
    const drift = Math.sin(input.timeSeconds * 0.47 + this.path.length * 0.33) * 0.48;
    return away + drift;
  }
}
