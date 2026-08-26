/**
 * Luminous Connectome Lab / Field Garden: layered 3D presentation only.
 * Sky, plants, water and light never change sensor values, connectome data, or body control.
 */
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Layer } from "@babylonjs/core/Layers/layer";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";

const DAWN_PANORAMA_URL = "/manus-storage/garden-dawn-panorama_712067d9.png";
const NIGHT_PANORAMA_URL = "/manus-storage/garden-night-panorama_62e31c61.png";

type Firefly = Readonly<{ anchor: TransformNode; phase: number; mesh: Mesh }>;

export class GardenScenery {
  private readonly grassAnchors: TransformNode[] = [];
  private readonly fireflies: Firefly[] = [];
  private readonly waterfallRibbons: Mesh[] = [];
  private readonly nightMaterials: StandardMaterial[] = [];
  private readonly dawnMaterials: StandardMaterial[] = [];
  private waterfallIntensity = 0.62;
  private daylight = 0.34;
  private waterfallMaterial: StandardMaterial | null = null;
  private skyDawn: Layer | null = null;
  private skyNight: Layer | null = null;
  private sun: Mesh | null = null;
  private moon: Mesh | null = null;

  constructor(scene: Scene) {
    this.createSkyRig(scene);
    this.createMossBeds(scene);
    this.createPondAndLily(scene);
    this.createWoodenBridge(scene);
    this.createWaterfall(scene);
    this.createTreesAndShrubs(scene);
    this.createGrassAndFlowers(scene);
    this.createSteppingStonesAndLog(scene);
    this.createStimulusLanterns(scene);
    this.createFireflies(scene);
    this.setDaylight(this.daylight);
  }

  update(elapsed: number): void {
    this.grassAnchors.forEach((anchor, index) => {
      anchor.rotation.z = Math.sin(elapsed * 0.78 + index * 1.37) * 0.085;
      anchor.rotation.x = Math.cos(elapsed * 0.58 + index * 0.83) * 0.04;
    });
    const night = 1 - this.daylight;
    this.fireflies.forEach(({ anchor, phase, mesh }) => {
      anchor.position.y = 0.3 + Math.sin(elapsed * 1.34 + phase) * 0.16;
      anchor.position.x += Math.cos(elapsed * 0.51 + phase) * 0.0007;
      anchor.position.z += Math.sin(elapsed * 0.47 + phase) * 0.0007;
      const pulse = 0.35 + Math.sin(elapsed * 2.6 + phase) * 0.3 + night * 0.55;
      mesh.scaling.setAll(0.65 + Math.max(0.05, pulse) * 0.55);
    });
    this.waterfallRibbons.forEach((ribbon, index) => {
      ribbon.position.y = 0.62 + Math.sin(elapsed * (0.9 + this.waterfallIntensity * 3.1) + index) * (0.008 + this.waterfallIntensity * 0.045);
      ribbon.scaling.x = 0.82 + this.waterfallIntensity * 0.24 + Math.sin(elapsed * (0.7 + this.waterfallIntensity * 2.1) + index * 1.73) * this.waterfallIntensity * 0.08;
    });
    if (this.sun) this.sun.position.y = 2.4 + this.daylight * 3.1 + Math.sin(elapsed * 0.03) * 0.05;
    if (this.moon) this.moon.rotation.z = elapsed * 0.018;
  }

  setWaterfallIntensity(value: number): void {
    this.waterfallIntensity = Math.max(0, Math.min(1, value));
    if (this.waterfallMaterial) {
      this.waterfallMaterial.alpha = 0.12 + this.waterfallIntensity * 0.68;
      this.waterfallMaterial.emissiveColor = Color3.FromHexString(this.waterfallIntensity > 0.55 ? "#2D9DC4" : "#174C60");
    }
  }

  setDaylight(value: number): void {
    this.daylight = Math.max(0, Math.min(1, value));
    const night = 1 - this.daylight;
    const twilight = 1 - Math.min(1, Math.abs(this.daylight - 0.5) * 2);
    if (this.skyDawn) this.skyDawn.color.a = 0.12 + this.daylight * 0.9;
    if (this.skyNight) this.skyNight.color.a = Math.max(0, night * 0.96 - this.daylight * 0.08);
    if (this.sun) this.sun.visibility = this.daylight > 0.06 ? 0.28 + this.daylight * 0.72 : 0;
    if (this.moon) this.moon.visibility = Math.max(0, night * 0.95 - this.daylight * 0.08);
    this.nightMaterials.forEach((material) => { material.alpha = 0.06 + night * 0.94; });
    this.dawnMaterials.forEach((material) => {
      material.emissiveColor = Color3.FromHexString(twilight > 0.35 ? "#B86C4A" : "#2C5E41");
    });
  }

  private createSkyRig(scene: Scene): void {
    this.skyNight = new Layer("garden-sky-night", NIGHT_PANORAMA_URL, scene, true);
    this.skyNight.color.a = 0.72;
    this.skyDawn = new Layer("garden-sky-dawn", DAWN_PANORAMA_URL, scene, true);
    this.skyDawn.color.a = 0.42;

    const sunMaterial = this.material(scene, "garden-sun", "#F5BF6B", "#F5A643");
    sunMaterial.disableLighting = true;
    const sunHalo = this.material(scene, "garden-sun-halo", "#F8C56F", "#D9883D");
    sunHalo.alpha = 0.24;
    sunHalo.disableLighting = true;
    this.sun = MeshBuilder.CreateSphere("garden-sun", { diameter: 0.64, segments: 16 }, scene);
    this.sun.position.set(4.7, 4.1, 5.9);
    this.sun.material = sunMaterial;
    const halo = MeshBuilder.CreateSphere("garden-sun-halo", { diameter: 1.15, segments: 16 }, scene);
    halo.position.copyFrom(this.sun.position);
    halo.material = sunHalo;

    const moonMaterial = this.material(scene, "garden-moon", "#D8E8F2", "#7CC9E6");
    moonMaterial.disableLighting = true;
    this.moon = MeshBuilder.CreateSphere("garden-moon", { diameter: 0.44, segments: 16 }, scene);
    this.moon.position.set(-4.7, 4.05, 5.55);
    this.moon.material = moonMaterial;

    const starMaterial = this.material(scene, "garden-stars", "#CBE9FF", "#5CAFD3");
    starMaterial.disableLighting = true;
    this.nightMaterials.push(starMaterial);
    const stars = [
      [-5.2, 4.4, 5.4], [-4.2, 3.75, 5.9], [-3.35, 4.86, 5.2], [-2.2, 4.22, 5.9], [-1.15, 4.98, 5.45],
      [0.4, 4.55, 5.86], [1.45, 4.08, 5.55], [2.25, 4.92, 5.75], [3.4, 4.42, 5.1], [4.2, 4.84, 5.55],
    ] as const;
    stars.forEach(([x, y, z], index) => {
      const star = MeshBuilder.CreateSphere(`garden-star-${index}`, { diameter: index % 3 === 0 ? 0.075 : 0.045, segments: 6 }, scene);
      star.position.set(x, y, z);
      star.material = starMaterial;
    });
  }

  private createMossBeds(scene: Scene): void {
    const moss = this.material(scene, "garden-moss", "#1A5A32", "#0D2E1E");
    const beds = [
      { x: -3.08, z: 2.24, width: 2.85, depth: 1.85 },
      { x: -3.78, z: -2.32, width: 2.25, depth: 1.55 },
      { x: 3.25, z: 2.35, width: 2.15, depth: 1.55 },
      { x: 3.92, z: -1.92, width: 1.58, depth: 1.22 },
    ] as const;
    beds.forEach((bed, index) => {
      const mesh = MeshBuilder.CreateCylinder(`garden-moss-bed-${index}`, { diameter: 1, height: 0.034, tessellation: 40 }, scene);
      mesh.position.set(bed.x, 0.012, bed.z);
      mesh.scaling.set(bed.width, 1, bed.depth);
      mesh.material = moss;
    });
  }

  private createPondAndLily(scene: Scene): void {
    const pond = MeshBuilder.CreateCylinder("garden-reflective-pond", { diameter: 1.9, height: 0.032, tessellation: 56 }, scene);
    pond.position.set(-3.02, 0.022, 2.2);
    pond.scaling.x = 1.48;
    const water = this.material(scene, "garden-water", "#2B86A0", "#0D485B");
    water.specularColor = Color3.FromHexString("#A5E8F5");
    water.alpha = 0.78;
    pond.material = water;
    for (let index = 0; index < 3; index += 1) {
      const lily = MeshBuilder.CreateDisc(`garden-lily-pad-${index}`, { radius: 0.22 + index * 0.035, tessellation: 24 }, scene);
      lily.position.set(-3.22 + index * 0.33, 0.046, 2.04 + (index % 2) * 0.35);
      lily.rotation.x = Math.PI / 2;
      lily.rotation.z = index * 0.72;
      lily.material = this.material(scene, `garden-lily-${index}`, index === 2 ? "#3E7E3F" : "#2F6740", "#12351E");
    }
    const flower = MeshBuilder.CreateSphere("garden-lily-flower", { diameter: 0.16, segments: 8 }, scene);
    flower.position.set(-3.16, 0.105, 2.38);
    flower.material = this.material(scene, "garden-lily-flower", "#F6B6D6", "#5D2644");
  }

  private createWoodenBridge(scene: Scene): void {
    const wood = this.material(scene, "garden-bridge-wood", "#8D5734", "#32160A");
    const railMaterial = this.material(scene, "garden-bridge-rail", "#6C3D25", "#1A0904");
    for (let index = -4; index <= 4; index += 1) {
      const plank = MeshBuilder.CreateBox(`garden-bridge-plank-${index}`, { width: 0.18, height: 0.075, depth: 1.5 }, scene);
      plank.position.set(-3.02 + index * 0.18, 0.22 + Math.abs(index) * 0.006, 2.2);
      plank.rotation.z = index * 0.014;
      plank.material = wood;
    }
    [-3.9, -2.14].forEach((x, index) => {
      const rail = MeshBuilder.CreateCylinder(`garden-bridge-rail-${index}`, { diameter: 0.045, height: 1.45, tessellation: 10 }, scene);
      rail.position.set(x, 0.52, 2.2);
      rail.rotation.x = Math.PI / 2;
      rail.material = railMaterial;
      [-0.52, 0.52].forEach((z, postIndex) => {
        const post = MeshBuilder.CreateCylinder(`garden-bridge-post-${index}-${postIndex}`, { diameter: 0.055, height: 0.58, tessellation: 10 }, scene);
        post.position.set(x, 0.3, 2.2 + z);
        post.material = railMaterial;
      });
    });
  }

  private createWaterfall(scene: Scene): void {
    const rock = this.material(scene, "garden-waterfall-rock", "#455B4E", "#13211D");
    const cliff = MeshBuilder.CreateIcoSphere("garden-waterfall-cliff", { radius: 0.76, subdivisions: 2 }, scene);
    cliff.position.set(-4.23, 0.58, 2.82);
    cliff.scaling.set(0.95, 1.42, 0.78);
    cliff.material = rock;
    [[-4.65, 0.3, 2.55], [-3.78, 0.24, 2.8], [-4.14, 0.22, 3.26]].forEach((point, index) => {
      const stone = MeshBuilder.CreateIcoSphere(`garden-waterfall-stone-${index}`, { radius: 0.29, subdivisions: 1 }, scene);
      stone.position.set(point[0], point[1], point[2]);
      stone.scaling.set(1.4, 0.66, 1);
      stone.material = rock;
    });
    const water = this.material(scene, "garden-waterfall", "#6DD5E7", "#167A9C");
    water.alpha = 0.7;
    water.backFaceCulling = false;
    this.waterfallMaterial = water;
    for (let index = 0; index < 5; index += 1) {
      const ribbon = MeshBuilder.CreatePlane(`garden-waterfall-ribbon-${index}`, { width: 0.115 + (index % 2) * 0.035, height: 0.9 }, scene);
      ribbon.position.set(-4.25 + (index - 2) * 0.12, 0.65, 2.44);
      ribbon.rotation.y = (index - 2) * 0.05;
      ribbon.material = water;
      this.waterfallRibbons.push(ribbon);
    }
  }

  private createTreesAndShrubs(scene: Scene): void {
    const trunk = this.material(scene, "garden-trunk", "#70412A", "#1E0C06");
    const canopyColors = ["#2F7B45", "#23663B", "#3F8E52"];
    const trees = [
      new Vector3(-4.1, 0, -2.95), new Vector3(4.02, 0, 3.12), new Vector3(4.12, 0, -3.2), new Vector3(-1.35, 0, -3.88),
    ];
    trees.forEach((position, index) => {
      const stem = MeshBuilder.CreateCylinder(`garden-tree-trunk-${index}`, { diameterTop: 0.13, diameterBottom: 0.29, height: 1.22 + (index % 2) * 0.18, tessellation: 10 }, scene);
      stem.position.copyFromFloats(position.x, 0.61, position.z);
      stem.material = trunk;
      [0, 1, 2].forEach((layer) => {
        const crown = MeshBuilder.CreateSphere(`garden-tree-crown-${index}-${layer}`, { diameter: 1.1 - layer * 0.13, segments: 10 }, scene);
        crown.position.copyFromFloats(position.x + (layer - 1) * 0.11, 1.1 + layer * 0.34, position.z + (layer % 2 ? 0.14 : -0.08));
        crown.scaling.y = 0.75;
        crown.material = this.material(scene, `garden-canopy-${index}-${layer}`, canopyColors[(index + layer) % canopyColors.length], "#102A1A");
      });
    });
    [new Vector3(-3.5, 0.28, 2.85), new Vector3(3.3, 0.26, 2.18), new Vector3(2.9, 0.26, -3.2), new Vector3(-2.62, 0.25, -3.28)].forEach((position, index) => {
      const bush = MeshBuilder.CreateIcoSphere(`garden-shrub-${index}`, { radius: 0.48, subdivisions: 2 }, scene);
      bush.position.copyFrom(position);
      bush.scaling.set(1.45, 0.78, 1.2);
      bush.material = this.material(scene, `garden-shrub-${index}`, index % 2 ? "#367F49" : "#286B3E", "#0F2A1B");
    });
  }

  private createGrassAndFlowers(scene: Scene): void {
    const grass = this.material(scene, "garden-grass", "#4DA65A", "#173E22");
    const flowerColors = ["#F092B8", "#F5C35D", "#BFA0F6", "#EF756E"];
    const clusters = [
      new Vector3(-3.25, 0, 1.35), new Vector3(2.7, 0, 3.15), new Vector3(3.1, 0, 2.25),
      new Vector3(-3.65, 0, -2.0), new Vector3(2.55, 0, -3.35), new Vector3(1.8, 0, 3.78),
    ];
    clusters.forEach((position, clusterIndex) => {
      const anchor = new TransformNode(`garden-grass-anchor-${clusterIndex}`, scene);
      anchor.position.copyFrom(position);
      this.grassAnchors.push(anchor);
      for (let blade = 0; blade < 14; blade += 1) {
        const mesh = MeshBuilder.CreatePlane(`garden-grass-${clusterIndex}-${blade}`, { width: 0.055 + (blade % 3) * 0.016, height: 0.3 + (blade % 4) * 0.045 }, scene);
        mesh.parent = anchor;
        mesh.position.set((blade % 5 - 2) * 0.1, 0.17, (Math.floor(blade / 5) - 1) * 0.15);
        mesh.rotation.y = blade * 0.73;
        mesh.material = grass;
      }
      for (let flowerIndex = 0; flowerIndex < 3; flowerIndex += 1) {
        const blossom = MeshBuilder.CreateSphere(`garden-flower-${clusterIndex}-${flowerIndex}`, { diameter: 0.11 + (flowerIndex % 2) * 0.035, segments: 8 }, scene);
        blossom.position.set(position.x + (flowerIndex - 1) * 0.17, 0.29 + flowerIndex * 0.025, position.z + (flowerIndex % 2 ? 0.12 : -0.08));
        blossom.material = this.material(scene, `garden-flower-material-${clusterIndex}-${flowerIndex}`, flowerColors[(clusterIndex + flowerIndex) % flowerColors.length], "#351127");
      }
    });
  }

  private createSteppingStonesAndLog(scene: Scene): void {
    const stone = this.material(scene, "garden-stone", "#5B6961", "#15201C");
    const path = [[-1.6, -0.03], [-1.16, 0.34], [-0.6, 0.56], [0.02, 0.52], [0.65, 0.28], [1.16, -0.08], [1.56, -0.48]] as const;
    path.forEach(([x, z], index) => {
      const mesh = MeshBuilder.CreateCylinder(`garden-path-stone-${index}`, { diameter: 0.5 + (index % 2) * 0.08, height: 0.045, tessellation: 12 }, scene);
      mesh.position.set(x, 0.022, z);
      mesh.scaling.z = 0.76;
      mesh.rotation.y = index * 0.48;
      mesh.material = stone;
    });
    [[-2.42, 0.18, 2.92], [2.9, 0.14, -2.58], [3.3, 0.14, 2.18], [1.98, 0.16, 3.55]].forEach((point, index) => {
      const mesh = MeshBuilder.CreateIcoSphere(`garden-stone-${index}`, { radius: 0.28, subdivisions: 1 }, scene);
      mesh.position.set(point[0], point[1], point[2]);
      mesh.scaling.set(1.35, 0.62, 0.9);
      mesh.material = stone;
    });
    const log = MeshBuilder.CreateCylinder("garden-log", { diameter: 0.28, height: 1.26, tessellation: 10 }, scene);
    log.position.set(3.3, 0.18, 2.18);
    log.rotation.z = Math.PI / 2.6;
    log.material = this.material(scene, "garden-log", "#855538", "#251107");
    const cap = this.material(scene, "garden-mushroom-cap", "#D9718B", "#4C1326");
    [-0.18, 0.06, 0.24].forEach((offset, index) => {
      const stem = MeshBuilder.CreateCylinder(`garden-mushroom-stem-${index}`, { diameter: 0.06, height: 0.18, tessellation: 8 }, scene);
      stem.position.set(3.03 + offset, 0.1, 2.46 + index * 0.06);
      stem.material = this.material(scene, `garden-mushroom-stem-mat-${index}`, "#F3E0C7", "#382416");
      const top = MeshBuilder.CreateSphere(`garden-mushroom-top-${index}`, { diameter: 0.16 + index * 0.018, segments: 8 }, scene);
      top.position.set(3.03 + offset, 0.2, 2.46 + index * 0.06);
      top.scaling.y = 0.55;
      top.material = cap;
    });
  }

  private createStimulusLanterns(scene: Scene): void {
    const lantern = MeshBuilder.CreateCylinder("garden-odor-lantern", { diameter: 0.24, height: 0.48, tessellation: 12 }, scene);
    lantern.position.set(2.36, 0.28, 1.5);
    lantern.material = this.material(scene, "garden-lantern", "#F0BA55", "#855A18");
    const windMarker = MeshBuilder.CreateSphere("garden-wind-marker", { diameter: 0.14, segments: 12 }, scene);
    windMarker.position.set(-2.7, 0.24, 2.25);
    windMarker.material = this.material(scene, "garden-wind-marker", "#7BE3F5", "#195266");
  }

  private createFireflies(scene: Scene): void {
    const material = this.material(scene, "garden-firefly", "#F8DF86", "#C89728");
    material.disableLighting = true;
    this.nightMaterials.push(material);
    const points = [
      [-2.78, 0.42, 1.72], [-3.32, 0.58, 2.62], [-3.68, 0.36, -2.02], [2.96, 0.45, 2.5],
      [3.58, 0.63, 2.05], [2.42, 0.38, -2.82], [-1.68, 0.48, -3.32], [1.75, 0.52, 3.62],
    ] as const;
    points.forEach((point, index) => {
      const anchor = new TransformNode(`garden-firefly-anchor-${index}`, scene);
      anchor.position.set(point[0], point[1], point[2]);
      const firefly = MeshBuilder.CreateSphere(`garden-firefly-${index}`, { diameter: 0.058, segments: 8 }, scene);
      firefly.parent = anchor;
      firefly.material = material;
      this.fireflies.push({ anchor, phase: index * 1.23, mesh: firefly });
    });
  }

  private material(scene: Scene, name: string, diffuse: string, emissive: string): StandardMaterial {
    const material = new StandardMaterial(name, scene);
    material.diffuseColor = Color3.FromHexString(diffuse);
    material.emissiveColor = Color3.FromHexString(emissive);
    material.specularColor = Color3.Black();
    return material;
  }
}
