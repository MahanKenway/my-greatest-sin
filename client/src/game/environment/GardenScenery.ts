/**
 * Luminous Connectome Lab: this is a modelled habitat dressing layer, not a behavioural or biological claim.
 * The composition uses a few low-poly CC0 GLBs around the arena edge so the specimen remains legible at centre stage.
 */
import "@babylonjs/loaders/glTF";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import { GARDEN_ASSETS, type GardenAssetKey } from "./gardenAssets";

type GardenPlacement = Readonly<{
  asset: GardenAssetKey;
  name: string;
  position: Vector3;
  scale: number;
  rotationY?: number;
}>;

const PLACEMENTS: readonly GardenPlacement[] = [
  { asset: "oakTree", name: "oak-shelter", position: new Vector3(-4.05, 0, -2.85), scale: 1.25, rotationY: 0.35 },
  { asset: "pineTree", name: "pine-canopy", position: new Vector3(3.95, 0, 3.1), scale: 1.08, rotationY: -0.5 },
  { asset: "smallTree", name: "small-tree", position: new Vector3(3.85, 0, -3.15), scale: 1.18, rotationY: 0.85 },
  { asset: "bush", name: "bush-bank", position: new Vector3(-3.5, 0, 2.85), scale: 1.32, rotationY: -0.4 },
  { asset: "leafGrass", name: "leaf-grass-bank", position: new Vector3(-3.15, 0, 1.55), scale: 1.25, rotationY: 0.1 },
  { asset: "grass", name: "grass-bank", position: new Vector3(2.45, 0, 3.55), scale: 1.5, rotationY: -0.65 },
  { asset: "largeRock", name: "pond-rock", position: new Vector3(-2.45, 0, 2.92), scale: 1.12, rotationY: 0.45 },
  { asset: "smallRock", name: "path-rock", position: new Vector3(2.85, 0, -2.58), scale: 1.36, rotationY: -0.7 },
  { asset: "lily", name: "pond-lily", position: new Vector3(-3.02, 0.04, 2.1), scale: 1.22, rotationY: 0.4 },
  { asset: "mushrooms", name: "mushroom-cluster", position: new Vector3(-3.75, 0, -2.2), scale: 1.05, rotationY: -0.25 },
  { asset: "log", name: "moss-log", position: new Vector3(3.3, 0, 2.18), scale: 1.16, rotationY: 0.7 },
  { asset: "purpleFlower", name: "purple-flowers", position: new Vector3(-3.45, 0, 1.2), scale: 1.14, rotationY: 0.2 },
  { asset: "redFlower", name: "red-flowers", position: new Vector3(3.42, 0, 2.82), scale: 1.02, rotationY: -0.55 },
  { asset: "yellowFlower", name: "yellow-flowers", position: new Vector3(-3.95, 0, -1.55), scale: 1.1, rotationY: 0.62 },
  { asset: "stonePath", name: "stone-path", position: new Vector3(1.15, 0.01, -2.9), scale: 1.18, rotationY: -0.3 },
  { asset: "stonePathCircle", name: "stone-path-circle", position: new Vector3(2.55, 0.01, -2.76), scale: 1.12, rotationY: 0.24 },
  { asset: "woodenBridge", name: "wooden-bridge", position: new Vector3(-3.02, 0.12, 2.2), scale: 1.05, rotationY: Math.PI / 2 },
];

export class GardenScenery {
  private readonly grassAnchors: TransformNode[] = [];
  private readonly fireflies: { anchor: TransformNode; phase: number }[] = [];
  private readonly waterfallRibbons: Mesh[] = [];

  constructor(scene: Scene) {
    this.createMossBeds(scene);
    this.createPond(scene);
    this.createWaterfall(scene);
    this.createStimulusLanterns(scene);
    this.createFireflies(scene);
    void Promise.all(PLACEMENTS.map((placement) => this.loadPlacement(scene, placement)));
  }

  update(elapsed: number): void {
    this.grassAnchors.forEach((anchor, index) => {
      anchor.rotation.z = Math.sin(elapsed * 0.95 + index * 1.7) * 0.055;
      anchor.rotation.x = Math.cos(elapsed * 0.72 + index * 0.9) * 0.028;
    });
    this.fireflies.forEach(({ anchor, phase }) => {
      anchor.position.y = 0.34 + Math.sin(elapsed * 1.45 + phase) * 0.18;
      anchor.position.x += Math.cos(elapsed * 0.7 + phase) * 0.0008;
      anchor.position.z += Math.sin(elapsed * 0.63 + phase) * 0.0008;
    });
    this.waterfallRibbons.forEach((ribbon, index) => {
      ribbon.position.y = 0.64 + Math.sin(elapsed * 2.2 + index) * 0.035;
      ribbon.scaling.x = 0.92 + Math.sin(elapsed * 1.45 + index * 1.9) * 0.06;
    });
  }

  private createMossBeds(scene: Scene): void {
    const moss = new StandardMaterial("garden-moss-material", scene);
    moss.diffuseColor = Color3.FromHexString("#0C3828");
    moss.emissiveColor = Color3.FromHexString("#0A2B1D");
    moss.specularColor = Color3.Black();
    moss.disableLighting = true;

    const beds = [
      { name: "pond-moss-bed", x: -3.08, z: 2.24, width: 2.85, depth: 1.85 },
      { name: "grove-moss-bed", x: -3.78, z: -2.32, width: 2.25, depth: 1.55 },
      { name: "log-moss-bed", x: 3.25, z: 2.35, width: 2.15, depth: 1.55 },
    ] as const;
    for (const bed of beds) {
      const mesh = MeshBuilder.CreateCylinder(bed.name, { diameter: 1, height: 0.024, tessellation: 32 }, scene);
      mesh.position.set(bed.x, 0.012, bed.z);
      mesh.scaling.set(bed.width, 1, bed.depth);
      mesh.material = moss;
    }
  }

  private createPond(scene: Scene): void {
    const pond = MeshBuilder.CreateCylinder("garden-reflective-pond", { diameter: 1.78, height: 0.028, tessellation: 48 }, scene);
    pond.position.set(-3.02, 0.018, 2.2);
    pond.scaling.x = 1.42;
    const water = new StandardMaterial("garden-water-material", scene);
    water.diffuseColor = Color3.FromHexString("#15536A");
    water.emissiveColor = Color3.FromHexString("#082D42");
    water.specularColor = Color3.FromHexString("#6DE5FF");
    water.alpha = 0.72;
    pond.material = water;
  }

  private createWaterfall(scene: Scene): void {
    const rockMaterial = new StandardMaterial("garden-waterfall-rock-material", scene);
    rockMaterial.diffuseColor = Color3.FromHexString("#284239");
    rockMaterial.emissiveColor = Color3.FromHexString("#0A1715");
    rockMaterial.specularColor = Color3.Black();
    const cliff = MeshBuilder.CreateBox("garden-waterfall-cliff", { width: 0.72, height: 1.02, depth: 0.48 }, scene);
    cliff.position.set(-4.08, 0.48, 2.7);
    cliff.material = rockMaterial;

    const waterMaterial = new StandardMaterial("garden-waterfall-material", scene);
    waterMaterial.diffuseColor = Color3.FromHexString("#4BB9D2");
    waterMaterial.emissiveColor = Color3.FromHexString("#0E5065");
    waterMaterial.alpha = 0.7;
    waterMaterial.backFaceCulling = false;
    for (let index = 0; index < 3; index += 1) {
      const ribbon = MeshBuilder.CreatePlane(`garden-waterfall-ribbon-${index}`, { width: 0.16, height: 0.82 }, scene);
      ribbon.position.set(-4.08 + (index - 1) * 0.16, 0.64, 2.43);
      ribbon.material = waterMaterial;
      this.waterfallRibbons.push(ribbon);
    }
  }

  private createStimulusLanterns(scene: Scene): void {
    const lanternMaterial = new StandardMaterial("garden-lantern-material", scene);
    lanternMaterial.diffuseColor = Color3.FromHexString("#E7B854");
    lanternMaterial.emissiveColor = Color3.FromHexString("#725218");
    const lantern = MeshBuilder.CreateCylinder("garden-odor-lantern", { diameter: 0.24, height: 0.48, tessellation: 12 }, scene);
    lantern.position.set(2.36, 0.28, 1.5);
    lantern.material = lanternMaterial;

    const windMarkerMaterial = new StandardMaterial("garden-wind-marker-material", scene);
    windMarkerMaterial.diffuseColor = Color3.FromHexString("#6DE5FF");
    windMarkerMaterial.emissiveColor = Color3.FromHexString("#164A5B");
    const windMarker = MeshBuilder.CreateSphere("garden-wind-marker", { diameter: 0.14, segments: 12 }, scene);
    windMarker.position.set(-2.7, 0.24, 2.25);
    windMarker.material = windMarkerMaterial;
  }

  private createFireflies(scene: Scene): void {
    const fireflyMaterial = new StandardMaterial("garden-firefly-material", scene);
    fireflyMaterial.diffuseColor = Color3.FromHexString("#F4D879");
    fireflyMaterial.emissiveColor = Color3.FromHexString("#B57A1D");
    fireflyMaterial.specularColor = Color3.Black();
    const points = [
      [-2.78, 0.42, 1.72], [-3.32, 0.58, 2.62], [-3.68, 0.36, -2.02],
      [2.96, 0.45, 2.5], [3.58, 0.63, 2.05], [2.42, 0.38, -2.82],
    ] as const;
    points.forEach((point, index) => {
      const anchor = new TransformNode(`garden-firefly-anchor-${index}`, scene);
      anchor.position.set(point[0], point[1], point[2]);
      const firefly = MeshBuilder.CreateSphere(`garden-firefly-${index}`, { diameter: 0.055, segments: 8 }, scene);
      firefly.parent = anchor;
      firefly.material = fireflyMaterial;
      this.fireflies.push({ anchor, phase: index * 1.23 });
    });
  }

  private async loadPlacement(scene: Scene, placement: GardenPlacement): Promise<void> {
    try {
      const result = await SceneLoader.ImportMeshAsync("", "", GARDEN_ASSETS[placement.asset], scene);
      const anchor = new TransformNode(`garden-${placement.name}`, scene);
      for (const mesh of result.meshes) {
        if (mesh.parent === null) mesh.parent = anchor;
      }
      anchor.position.copyFrom(placement.position);
      anchor.scaling.setAll(placement.scale);
      anchor.rotation.y = placement.rotationY ?? 0;
      if (placement.asset === "grass" || placement.asset === "leafGrass") this.grassAnchors.push(anchor);
    } catch {
      // A missing decorative asset must not prevent the scientific simulation from running.
    }
  }
}
