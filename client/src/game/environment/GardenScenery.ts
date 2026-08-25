/**
 * Luminous Connectome Lab: a lightweight modelled habitat dressing layer.
 * Every mesh here is decorative presentation only; it never changes neural data or sensor values.
 */
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";

type Firefly = Readonly<{ anchor: TransformNode; phase: number }>;

export class GardenScenery {
  private readonly grassAnchors: TransformNode[] = [];
  private readonly fireflies: Firefly[] = [];
  private readonly waterfallRibbons: Mesh[] = [];
  private waterfallIntensity = 0.62;
  private waterfallMaterial: StandardMaterial | null = null;

  constructor(scene: Scene) {
    this.createMossBeds(scene);
    this.createPondAndLily(scene);
    this.createWoodenBridge(scene);
    this.createWaterfall(scene);
    this.createTreesAndShrubs(scene);
    this.createGrassAndFlowers(scene);
    this.createStonesAndLog(scene);
    this.createStimulusLanterns(scene);
    this.createFireflies(scene);
  }

  update(elapsed: number): void {
    this.grassAnchors.forEach((anchor, index) => {
      anchor.rotation.z = Math.sin(elapsed * 0.95 + index * 1.7) * 0.065;
      anchor.rotation.x = Math.cos(elapsed * 0.72 + index * 0.9) * 0.035;
    });
    this.fireflies.forEach(({ anchor, phase }) => {
      anchor.position.y = 0.34 + Math.sin(elapsed * 1.45 + phase) * 0.18;
      anchor.position.x += Math.cos(elapsed * 0.7 + phase) * 0.0008;
      anchor.position.z += Math.sin(elapsed * 0.63 + phase) * 0.0008;
    });
    this.waterfallRibbons.forEach((ribbon, index) => {
      ribbon.position.y = 0.64 + Math.sin(elapsed * (0.8 + this.waterfallIntensity * 3.2) + index) * (0.008 + this.waterfallIntensity * 0.05);
      ribbon.scaling.x = 0.85 + this.waterfallIntensity * 0.2 + Math.sin(elapsed * (0.6 + this.waterfallIntensity * 2.3) + index * 1.9) * this.waterfallIntensity * 0.075;
    });
  }

  setWaterfallIntensity(value: number): void {
    this.waterfallIntensity = Math.max(0, Math.min(1, value));
    if (this.waterfallMaterial) {
      this.waterfallMaterial.alpha = 0.14 + this.waterfallIntensity * 0.66;
      this.waterfallMaterial.emissiveColor = Color3.FromHexString(this.waterfallIntensity > 0.55 ? "#146C87" : "#0A3040");
    }
  }

  private createMossBeds(scene: Scene): void {
    const moss = this.material(scene, "garden-moss", "#0C3828", "#0A2B1D");
    moss.specularColor = Color3.Black();
    moss.disableLighting = true;
    const beds = [
      { x: -3.08, z: 2.24, width: 2.85, depth: 1.85 },
      { x: -3.78, z: -2.32, width: 2.25, depth: 1.55 },
      { x: 3.25, z: 2.35, width: 2.15, depth: 1.55 },
    ] as const;
    beds.forEach((bed, index) => {
      const mesh = MeshBuilder.CreateCylinder(`garden-moss-bed-${index}`, { diameter: 1, height: 0.024, tessellation: 32 }, scene);
      mesh.position.set(bed.x, 0.012, bed.z);
      mesh.scaling.set(bed.width, 1, bed.depth);
      mesh.material = moss;
    });
  }

  private createPondAndLily(scene: Scene): void {
    const pond = MeshBuilder.CreateCylinder("garden-reflective-pond", { diameter: 1.78, height: 0.028, tessellation: 48 }, scene);
    pond.position.set(-3.02, 0.018, 2.2);
    pond.scaling.x = 1.42;
    const water = this.material(scene, "garden-water", "#15536A", "#082D42");
    water.specularColor = Color3.FromHexString("#6DE5FF");
    water.alpha = 0.72;
    pond.material = water;

    const lily = MeshBuilder.CreateDisc("garden-lily-pad", { radius: 0.32, tessellation: 24 }, scene);
    lily.position.set(-3.12, 0.04, 2.12);
    lily.rotation.x = Math.PI / 2;
    lily.material = this.material(scene, "garden-lily", "#2C6B42", "#12311E");
    const flower = MeshBuilder.CreateSphere("garden-lily-flower", { diameter: 0.14, segments: 8 }, scene);
    flower.position.set(-3.18, 0.09, 2.12);
    flower.material = this.material(scene, "garden-lily-flower", "#F1B7D2", "#51203B");
  }

  private createWoodenBridge(scene: Scene): void {
    const wood = this.material(scene, "garden-bridge-wood", "#6E4027", "#1B0C06");
    wood.specularColor = Color3.FromHexString("#3A2114");
    for (let index = -3; index <= 3; index += 1) {
      const plank = MeshBuilder.CreateBox(`garden-bridge-plank-${index}`, { width: 0.19, height: 0.07, depth: 1.42 }, scene);
      plank.position.set(-3.02 + index * 0.19, 0.22 + Math.abs(index) * 0.006, 2.2);
      plank.rotation.z = index * 0.017;
      plank.material = wood;
    }
    [-3.82, -2.22].forEach((x) => {
      const rail = MeshBuilder.CreateCylinder(`garden-bridge-rail-${x}`, { diameter: 0.05, height: 1.38, tessellation: 10 }, scene);
      rail.position.set(x, 0.55, 2.2);
      rail.rotation.x = Math.PI / 2;
      rail.material = wood;
    });
  }

  private createWaterfall(scene: Scene): void {
    const rock = this.material(scene, "garden-waterfall-rock", "#284239", "#0A1715");
    rock.specularColor = Color3.Black();
    const cliff = MeshBuilder.CreateIcoSphere("garden-waterfall-cliff", { radius: 0.58, subdivisions: 2 }, scene);
    cliff.position.set(-4.08, 0.48, 2.7);
    cliff.scaling.set(0.78, 1.3, 0.65);
    cliff.material = rock;

    const water = this.material(scene, "garden-waterfall", "#4BB9D2", "#0E5065");
    water.alpha = 0.7;
    water.backFaceCulling = false;
    this.waterfallMaterial = water;
    for (let index = 0; index < 3; index += 1) {
      const ribbon = MeshBuilder.CreatePlane(`garden-waterfall-ribbon-${index}`, { width: 0.16, height: 0.82 }, scene);
      ribbon.position.set(-4.08 + (index - 1) * 0.16, 0.64, 2.43);
      ribbon.material = water;
      this.waterfallRibbons.push(ribbon);
    }
  }

  private createTreesAndShrubs(scene: Scene): void {
    const trunk = this.material(scene, "garden-trunk", "#5B3523", "#170B06");
    const canopy = this.material(scene, "garden-canopy", "#1E643E", "#0A2418");
    const shrub = this.material(scene, "garden-shrub", "#2A7C4D", "#102A1E");
    const trees = [
      new Vector3(-4.0, 0, -2.85), new Vector3(3.95, 0, 3.1), new Vector3(3.85, 0, -3.15),
    ];
    trees.forEach((position, index) => {
      const stem = MeshBuilder.CreateCylinder(`garden-tree-trunk-${index}`, { diameterTop: 0.16, diameterBottom: 0.26, height: 1.18, tessellation: 10 }, scene);
      stem.position.copyFromFloats(position.x, 0.59, position.z);
      stem.material = trunk;
      [0, 1, 2].forEach((layer) => {
        const crown = MeshBuilder.CreateSphere(`garden-tree-crown-${index}-${layer}`, { diameter: 1.05 - layer * 0.12, segments: 8 }, scene);
        crown.position.copyFromFloats(position.x + (layer - 1) * 0.1, 1.1 + layer * 0.34, position.z + (layer % 2 ? 0.12 : -0.08));
        crown.scaling.y = 0.8;
        crown.material = canopy;
      });
    });
    [new Vector3(-3.5, 0.28, 2.85), new Vector3(3.3, 0.26, 2.18)].forEach((position, index) => {
      const bush = MeshBuilder.CreateIcoSphere(`garden-shrub-${index}`, { radius: 0.48, subdivisions: 2 }, scene);
      bush.position.copyFrom(position);
      bush.scaling.set(1.4, 0.75, 1.15);
      bush.material = shrub;
    });
  }

  private createGrassAndFlowers(scene: Scene): void {
    const grass = this.material(scene, "garden-grass", "#3D995A", "#123820");
    const flowers = ["#E684B6", "#E7B854", "#A987E3"].map((color, index) => this.material(scene, `garden-flower-${index}`, color, "#2A101B"));
    const clusters = [new Vector3(-3.25, 0, 1.35), new Vector3(2.7, 0, 3.15), new Vector3(3.1, 0, 2.25)];
    clusters.forEach((position, clusterIndex) => {
      const anchor = new TransformNode(`garden-grass-anchor-${clusterIndex}`, scene);
      anchor.position.copyFrom(position);
      this.grassAnchors.push(anchor);
      for (let blade = 0; blade < 8; blade += 1) {
        const mesh = MeshBuilder.CreatePlane(`garden-grass-${clusterIndex}-${blade}`, { width: 0.09, height: 0.36 + (blade % 3) * 0.04 }, scene);
        mesh.parent = anchor;
        mesh.position.set((blade % 4 - 1.5) * 0.1, 0.18, (Math.floor(blade / 4) - 0.5) * 0.17);
        mesh.rotation.y = blade * 0.82;
        mesh.material = grass;
      }
      const blossom = MeshBuilder.CreateSphere(`garden-flower-${clusterIndex}`, { diameter: 0.16, segments: 8 }, scene);
      blossom.position.copyFromFloats(position.x + 0.08, 0.3, position.z - 0.05);
      blossom.material = flowers[clusterIndex];
    });
  }

  private createStonesAndLog(scene: Scene): void {
    const stone = this.material(scene, "garden-stone", "#48514D", "#101715");
    [[-2.42, 0.18, 2.92], [2.9, 0.14, -2.58], [3.3, 0.14, 2.18]].forEach((point, index) => {
      const mesh = MeshBuilder.CreateIcoSphere(`garden-stone-${index}`, { radius: 0.28, subdivisions: 1 }, scene);
      mesh.position.copyFromFloats(point[0], point[1], point[2]);
      mesh.scaling.set(1.35, 0.62, 0.9);
      mesh.material = stone;
    });
    const log = MeshBuilder.CreateCylinder("garden-log", { diameter: 0.28, height: 1.15, tessellation: 10 }, scene);
    log.position.set(3.3, 0.18, 2.18);
    log.rotation.z = Math.PI / 2.6;
    log.material = this.material(scene, "garden-log", "#70452E", "#1E0E08");
  }

  private createStimulusLanterns(scene: Scene): void {
    const lantern = MeshBuilder.CreateCylinder("garden-odor-lantern", { diameter: 0.24, height: 0.48, tessellation: 12 }, scene);
    lantern.position.set(2.36, 0.28, 1.5);
    lantern.material = this.material(scene, "garden-lantern", "#E7B854", "#725218");
    const windMarker = MeshBuilder.CreateSphere("garden-wind-marker", { diameter: 0.14, segments: 12 }, scene);
    windMarker.position.set(-2.7, 0.24, 2.25);
    windMarker.material = this.material(scene, "garden-wind-marker", "#6DE5FF", "#164A5B");
  }

  private createFireflies(scene: Scene): void {
    const material = this.material(scene, "garden-firefly", "#F4D879", "#B57A1D");
    material.specularColor = Color3.Black();
    const points = [
      [-2.78, 0.42, 1.72], [-3.32, 0.58, 2.62], [-3.68, 0.36, -2.02],
      [2.96, 0.45, 2.5], [3.58, 0.63, 2.05], [2.42, 0.38, -2.82],
    ] as const;
    points.forEach((point, index) => {
      const anchor = new TransformNode(`garden-firefly-anchor-${index}`, scene);
      anchor.position.set(point[0], point[1], point[2]);
      const firefly = MeshBuilder.CreateSphere(`garden-firefly-${index}`, { diameter: 0.055, segments: 8 }, scene);
      firefly.parent = anchor;
      firefly.material = material;
      this.fireflies.push({ anchor, phase: index * 1.23 });
    });
  }

  private material(scene: Scene, name: string, diffuse: string, emissive: string): StandardMaterial {
    const material = new StandardMaterial(name, scene);
    material.diffuseColor = Color3.FromHexString(diffuse);
    material.emissiveColor = Color3.FromHexString(emissive);
    material.specularColor = Color3.Black();
    material.disableLighting = true;
    return material;
  }
}
