/** Luminous Connectome Lab / Field Garden: presentation is modelled and never changes source physiology. */
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { EnvironmentPresentation, SensorFrame } from "@/game/shared/types";
import { GardenScenery } from "./GardenScenery";

type FoodTargetVisual = Readonly<{
  id: string;
  label: string;
  value: number;
  position: Vector3;
  mesh: Mesh;
  baseScale: number;
}>;

export class Arena {
  private foodAmount = 0.76;
  private windAmount = 0.14;
  private lightAmount = 0.62;
  private touchPulse = 0;
  private temperatureShift = 0;
  private readonly environment: EnvironmentPresentation = { daylight: 0.68, waterfall: 0.62, provenance: "MODELLED MAPPING" };
  private readonly foodTargets: FoodTargetVisual[] = [];
  private readonly lightPosition = new Vector3(-2.8, 0.06, -1.1);
  private readonly lightMesh;
  private readonly garden: GardenScenery;

  constructor(private readonly scene: Scene) {
    const ground = MeshBuilder.CreateGround("specimen-ground", { width: 17.6, height: 15.2, subdivisions: 24 }, scene);
    ground.position.y = -0.025;
    const groundMaterial = new StandardMaterial("mineral-ground", scene);
    groundMaterial.diffuseColor = Color3.FromHexString("#1C4326");
    groundMaterial.emissiveColor = Color3.FromHexString("#07160B");
    groundMaterial.specularColor = Color3.Black();
    groundMaterial.disableLighting = false;
    ground.material = groundMaterial;

    this.addFoodTarget("bacterial-lawn", "BACTERIAL LAWN", 1, new Vector3(2.35, 0.14, 1.5), 0.34, "#E7B854", "#5D4210");
    this.addFoodTarget("yeast-flake", "YEAST FLAKE", 0.62, new Vector3(-2.18, 0.13, 2.45), 0.26, "#D77AB6", "#582342");
    this.addFoodTarget("mineral-drop", "MINERAL DROP", 0.38, new Vector3(-0.75, 0.11, -2.36), 0.22, "#74D6E7", "#1A5260");

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
    const foodSamples = this.foodTargets.map((target) => ({ target, signal: this.fieldAt(position, target.position, 6.2) * this.foodAmount * target.value }));
    const foodField = Math.max(0, ...foodSamples.map((sample) => sample.signal));
    const lightField = this.fieldAt(position, this.lightPosition, 7.4) * this.lightAmount;
    const lightAngle = Math.atan2(this.lightPosition.z - position.z, this.lightPosition.x - position.x) - heading;
    const foodDirection = foodSamples.reduce((sum, sample) => sum + Math.sin(Math.atan2(sample.target.position.z - position.z, sample.target.position.x - position.x) - heading) * sample.signal, 0);
    const direction = foodDirection + Math.sin(lightAngle) * lightField * 0.35;
    const boundaryTouch = Math.max(0, Math.abs(position.x) - 4.35, Math.abs(position.z) - 3.75) * 4;
    for (const target of this.foodTargets) target.mesh.scaling.setAll(target.baseScale * (0.72 + this.foodAmount * 0.48));
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

  private addFoodTarget(id: string, label: string, value: number, position: Vector3, diameter: number, diffuse: string, emissive: string): void {
    const mesh = MeshBuilder.CreateSphere(`c-elegans-food-${id}`, { diameter, segments: 16 }, this.scene);
    mesh.position.copyFrom(position);
    const material = new StandardMaterial(`c-elegans-food-${id}-material`, this.scene);
    material.diffuseColor = Color3.FromHexString(diffuse);
    material.emissiveColor = Color3.FromHexString(emissive);
    material.specularColor = Color3.Black();
    mesh.material = material;
    this.foodTargets.push({ id, label, value, position, mesh, baseScale: 1 });
  }

  private applyDaylight(daylight: number): void {
    const ambient = this.scene.getLightByName("lab-ambient");
    const specimenLight = this.scene.getLightByName("specimen-light");
    const gardenFill = this.scene.getLightByName("garden-fill");
    const gardenRim = this.scene.getLightByName("garden-rim");
    const night = 1 - daylight;
    const twilight = 1 - Math.min(1, Math.abs(daylight - 0.5) * 2);
    if (ambient instanceof HemisphericLight) {
      ambient.intensity = 0.18 + daylight * 0.57;
      ambient.diffuse.set(0.14 + daylight * 0.58 + twilight * 0.08, 0.22 + daylight * 0.48, 0.36 + daylight * 0.34);
      ambient.groundColor.set(0.012 + daylight * 0.08, 0.022 + daylight * 0.1, 0.038 + daylight * 0.095);
    }
    if (specimenLight instanceof PointLight) {
      specimenLight.intensity = 2.15 + night * 4.25 + twilight * 0.7;
      specimenLight.diffuse.set(0.82 + twilight * 0.16, 0.44 + daylight * 0.34, 0.24 + daylight * 0.34);
    }
    if (gardenFill instanceof PointLight) {
      gardenFill.intensity = 0.14 + daylight * 0.64;
      gardenFill.diffuse.set(0.16 + daylight * 0.16, 0.44 + daylight * 0.32, 0.48 + daylight * 0.26);
    }
    if (gardenRim instanceof PointLight) {
      gardenRim.intensity = 0.15 + night * 0.54 + twilight * 0.12;
      gardenRim.diffuse.set(0.36 + twilight * 0.42, 0.38 + twilight * 0.2, 0.62 + night * 0.2);
    }
    this.garden.setDaylight(daylight);
    this.scene.clearColor = new Color4(0.014 + daylight * 0.09, 0.028 + daylight * 0.11, 0.055 + daylight * 0.15, 0);
  }
}
