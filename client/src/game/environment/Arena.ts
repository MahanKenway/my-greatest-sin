/** Luminous Connectome Lab: an explicit modelled environmental field, never a claim of source-derived physiology. */
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import type { EnvironmentPresentation, SensorFrame } from "@/game/shared/types";
import { GardenScenery } from "./GardenScenery";

export class Arena {
  private foodAmount = 0.76;
  private windAmount = 0.14;
  private lightAmount = 0.62;
  private touchPulse = 0;
  private temperatureShift = 0;
  private readonly environment: EnvironmentPresentation = { daylight: 0.34, waterfall: 0.62, provenance: "MODELLED MAPPING" };
  private readonly foodPosition = new Vector3(2.35, 0.14, 1.5);
  private readonly lightPosition = new Vector3(-2.8, 0.06, -1.1);
  private readonly foodMesh;
  private readonly lightMesh;
  private readonly garden: GardenScenery;

  constructor(private readonly scene: Scene) {
    const ground = MeshBuilder.CreateGround("specimen-ground", { width: 17.6, height: 15.2, subdivisions: 24 }, scene);
    ground.position.y = -0.025;
    const groundMaterial = new StandardMaterial("mineral-ground", scene);
    groundMaterial.diffuseColor = Color3.FromHexString("#1C4326");
    groundMaterial.emissiveColor = Color3.FromHexString("#07160B");
    groundMaterial.specularColor = Color3.Black();
    groundMaterial.disableLighting = true;
    ground.material = groundMaterial;

    this.foodMesh = MeshBuilder.CreateSphere("food-sample", { diameter: 0.34, segments: 16 }, scene);
    this.foodMesh.position.copyFrom(this.foodPosition);
    const foodMaterial = new StandardMaterial("food-material", scene);
    foodMaterial.diffuseColor = Color3.FromHexString("#E7B854");
    foodMaterial.emissiveColor = Color3.FromHexString("#5D4210");
    this.foodMesh.material = foodMaterial;

    this.lightMesh = MeshBuilder.CreateCylinder("light-pool", { diameter: 1.25, height: 0.018, tessellation: 48 }, scene);
    this.lightMesh.position.copyFrom(this.lightPosition);
    const lightMaterial = new StandardMaterial("light-pool-material", scene);
    lightMaterial.diffuseColor = Color3.FromHexString("#E7B854");
    lightMaterial.emissiveColor = Color3.FromHexString("#583F13");
    lightMaterial.alpha = 0.48;
    this.lightMesh.material = lightMaterial;

    const windMaterial = new StandardMaterial("wind-probe-material", scene);
    windMaterial.diffuseColor = Color3.FromHexString("#6DE5FF");
    windMaterial.emissiveColor = Color3.FromHexString("#164A5B");
    const windProbe = MeshBuilder.CreateTorus("wind-probe", { diameter: 0.7, thickness: 0.045, tessellation: 28 }, scene);
    windProbe.position.set(-2.7, 0.08, 2.25);
    windProbe.rotation.x = Math.PI / 2;
    windProbe.material = windMaterial;

    const wallMaterial = new StandardMaterial("arena-wall-material", scene);
    wallMaterial.diffuseColor = Color3.FromHexString("#11212D");
    wallMaterial.alpha = 0.82;
    const walls = [
      [0, -7.55, 17.6, 0.12], [0, 7.55, 17.6, 0.12], [-8.75, 0, 0.12, 15.2], [8.75, 0, 0.12, 15.2],
    ] as const;
    for (const [x, z, width, depth] of walls) {
      const wall = MeshBuilder.CreateBox("arena-boundary", { width, depth, height: 0.18 }, scene);
      wall.position.set(x, 0.08, z);
      wall.material = wallMaterial;
    }

    this.garden = new GardenScenery(scene);
    this.applyDaylight(this.environment.daylight);
  }

  updatePresentation(elapsed: number): void {
    this.garden.update(elapsed);
  }

  getPresentation(): EnvironmentPresentation {
    return this.environment;
  }

  setPresentation(setting: "daylight" | "waterfall", amount: number): void {
    const value = Math.max(0, Math.min(1, amount));
    if (setting === "waterfall") {
      this.environment.waterfall = value;
      this.garden.setWaterfallIntensity(value);
      return;
    }
    this.environment.daylight = value;
    this.applyDaylight(value);
  }

  apply(stimulus: "food" | "wind" | "light" | "touch" | "temperature", amount: number): void {
    const value = Math.max(0, Math.min(1, amount));
    if (stimulus === "food") this.foodAmount = value;
    if (stimulus === "wind") this.windAmount = value;
    if (stimulus === "light") this.lightAmount = value;
    if (stimulus === "touch") this.touchPulse = Math.max(this.touchPulse, value);
    if (stimulus === "temperature") this.temperatureShift = value * 2 - 1;
  }

  sample(position: Vector3, heading: number, dt: number): SensorFrame {
    this.touchPulse = Math.max(0, this.touchPulse - dt * 1.9);
    const foodField = this.fieldAt(position, this.foodPosition, 6.2) * this.foodAmount;
    const lightField = this.fieldAt(position, this.lightPosition, 7.4) * this.lightAmount;
    const foodAngle = Math.atan2(this.foodPosition.z - position.z, this.foodPosition.x - position.x) - heading;
    const lightAngle = Math.atan2(this.lightPosition.z - position.z, this.lightPosition.x - position.x) - heading;
    const direction = Math.sin(foodAngle) * foodField + Math.sin(lightAngle) * lightField * 0.35;
    const boundaryTouch = Math.max(0, Math.abs(position.x) - 4.35, Math.abs(position.z) - 3.75) * 4;
    this.foodMesh.scaling.setAll(0.45 + this.foodAmount * 0.7);
    this.lightMesh.scaling.setAll(0.55 + this.lightAmount * 0.65);

    return {
      food: foodField,
      odor: foodField,
      light: lightField,
      leftCue: Math.max(0, direction),
      rightCue: Math.max(0, -direction),
      wind: this.windAmount * (0.55 + 0.45 * Math.sin(heading + position.x * 0.7)),
      touch: Math.min(1, this.touchPulse + boundaryTouch),
      temperature: this.temperatureShift,
      taste: foodField > 0.85 ? foodField : 0,
      provenance: "MODELLED MAPPING",
    };
  }

  private fieldAt(position: Vector3, source: Vector3, radius: number): number {
    return Math.max(0, 1 - Vector3.Distance(position, source) / radius);
  }

  private applyDaylight(daylight: number): void {
    const ambient = this.scene.getLightByName("lab-ambient");
    const specimenLight = this.scene.getLightByName("specimen-light");
    const gardenFill = this.scene.getLightByName("garden-fill");
    const gardenRim = this.scene.getLightByName("garden-rim");
    if (ambient instanceof HemisphericLight) {
      ambient.intensity = 0.16 + daylight * 0.5;
      ambient.diffuse.set(0.2 + daylight * 0.35, 0.3 + daylight * 0.32, 0.4 + daylight * 0.25);
      ambient.groundColor.set(0.014 + daylight * 0.065, 0.025 + daylight * 0.08, 0.04 + daylight * 0.08);
    }
    if (specimenLight instanceof PointLight) specimenLight.intensity = 2 + (1 - daylight) * 5;
    if (gardenFill instanceof PointLight) gardenFill.intensity = 0.12 + daylight * 0.48;
    if (gardenRim instanceof PointLight) gardenRim.intensity = 0.1 + (1 - daylight) * 0.32;
    this.scene.clearColor = new Color4(0.012 + daylight * 0.06, 0.03 + daylight * 0.085, 0.05 + daylight * 0.09, 1);
  }
}
