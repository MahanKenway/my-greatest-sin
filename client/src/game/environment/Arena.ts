/** Luminous Connectome Lab: an explicit modelled environmental field, never a claim of source-derived physiology. */
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import type { SensorFrame } from "@/game/shared/types";

const FLOOR_URL = "/manus-storage/digital-fly-specimen-floor_c2cc3595.png";

export class Arena {
  private foodAmount = 0.76;
  private windAmount = 0.14;
  private lightAmount = 0.62;
  private touchPulse = 0;
  private temperatureShift = 0;
  private readonly foodPosition = new Vector3(2.35, 0.14, 1.5);
  private readonly lightPosition = new Vector3(-2.8, 0.06, -1.1);
  private readonly foodMesh;
  private readonly lightMesh;

  constructor(scene: Scene) {
    const ground = MeshBuilder.CreateGround("specimen-ground", { width: 9.8, height: 8.6, subdivisions: 2 }, scene);
    const groundMaterial = new StandardMaterial("mineral-ground", scene);
    const floorTexture = new Texture(FLOOR_URL, scene, true, false);
    floorTexture.uScale = 4;
    floorTexture.vScale = 4;
    groundMaterial.diffuseTexture = floorTexture;
    groundMaterial.specularColor = Color3.Black();
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

    const obstacleMaterial = new StandardMaterial("obstacle-material", scene);
    obstacleMaterial.diffuseColor = Color3.FromHexString("#CBD6DB");
    obstacleMaterial.emissiveColor = Color3.FromHexString("#14222D");
    const obstacle = MeshBuilder.CreateBox("observation-obstacle", { width: 1.0, depth: 0.52, height: 0.42 }, scene);
    obstacle.position.set(2.2, 0.21, -2.15);
    obstacle.material = obstacleMaterial;

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
      [0, -4.3, 9.8, 0.12], [0, 4.3, 9.8, 0.12], [-4.9, 0, 0.12, 8.6], [4.9, 0, 0.12, 8.6],
    ] as const;
    for (const [x, z, width, depth] of walls) {
      const wall = MeshBuilder.CreateBox("arena-boundary", { width, depth, height: 0.18 }, scene);
      wall.position.set(x, 0.08, z);
      wall.material = wallMaterial;
    }
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
}
