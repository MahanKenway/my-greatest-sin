/** Luminous Connectome Lab: articulated insect presentation; source GLB is a visual reference only because it has no skeleton or animation tracks. */
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { MotorFrame } from "@/game/shared/types";
import type { BodyController } from "./types";

type LegRig = Readonly<{ hip: TransformNode; knee: TransformNode; ankle: TransformNode; phase: number; side: number }>;

export class FlyBody implements BodyController {
  private readonly root: TransformNode;
  private readonly visual: TransformNode;
  private readonly wings: TransformNode[] = [];
  private readonly legs: LegRig[] = [];
  private heading = 0.2;
  private gaitPhase = 0;

  constructor(scene: Scene) {
    this.root = new TransformNode("drosophila-articulated-body", scene);
    this.root.position.set(-0.65, 0.24, -0.5);
    this.visual = new TransformNode("drosophila-modelled-articulated-presentation", scene);
    this.visual.parent = this.root;

    const cuticle = this.material(scene, "drosophila-cuticle", "#7D371E", "#210A05", "#D08A3D", 46);
    const abdomen = this.material(scene, "drosophila-abdomen", "#B8672B", "#241006", "#EDB064", 36);
    const limb = this.material(scene, "drosophila-articulated-limb", "#3A1B12", "#070303", "#7B4227", 20);
    const eye = this.material(scene, "drosophila-compound-eye", "#6A1322", "#140205", "#F45B4B", 72);
    const wing = this.material(scene, "drosophila-wing-membrane", "#E6D7A5", "#2B260E", "#FFF5D4", 22);
    wing.alpha = 0.58;
    wing.backFaceCulling = false;

    const thorax = MeshBuilder.CreateSphere("drosophila-thorax", { diameter: 1, segments: 24 }, scene);
    thorax.parent = this.visual;
    thorax.position.set(0.06, 0.2, 0);
    thorax.scaling.set(0.72, 0.56, 0.52);
    thorax.material = cuticle;

    const abdomenMesh = MeshBuilder.CreateSphere("drosophila-abdomen", { diameter: 1, segments: 24 }, scene);
    abdomenMesh.parent = this.visual;
    abdomenMesh.position.set(-0.72, 0.18, 0);
    abdomenMesh.scaling.set(1.18, 0.43, 0.46);
    abdomenMesh.material = abdomen;
    for (let stripe = 0; stripe < 4; stripe += 1) {
      const band = MeshBuilder.CreateTorus(`drosophila-abdomen-band-${stripe}`, { diameter: 0.78 - stripe * 0.025, thickness: 0.045, tessellation: 20 }, scene);
      band.parent = this.visual;
      band.rotation.y = Math.PI / 2;
      band.position.set(-0.35 - stripe * 0.28, 0.18, 0);
      band.scaling.set(0.82, 1, 1);
      band.material = limb;
    }

    const head = MeshBuilder.CreateSphere("drosophila-head", { diameter: 0.66, segments: 20 }, scene);
    head.parent = this.visual;
    head.position.set(0.64, 0.22, 0);
    head.scaling.set(0.86, 0.88, 0.9);
    head.material = cuticle;
    for (const side of [-1, 1]) {
      const compoundEye = MeshBuilder.CreateSphere(`drosophila-compound-eye-${side}`, { diameter: 0.32, segments: 16 }, scene);
      compoundEye.parent = this.visual;
      compoundEye.position.set(0.84, 0.27, side * 0.26);
      compoundEye.scaling.set(0.65, 0.9, 1.15);
      compoundEye.material = eye;
      const antenna = MeshBuilder.CreateCylinder(`drosophila-antenna-${side}`, { diameter: 0.025, height: 0.42, tessellation: 8 }, scene);
      antenna.parent = this.visual;
      antenna.position.set(0.96, 0.52, side * 0.14);
      antenna.rotation.z = side * 0.7;
      antenna.rotation.y = -0.46;
      antenna.material = limb;
    }

    for (const side of [-1, 1]) {
      const pivot = new TransformNode(`drosophila-wing-pivot-${side}`, scene);
      pivot.parent = this.visual;
      pivot.position.set(-0.05, 0.54, side * 0.34);
      const membrane = MeshBuilder.CreateDisc(`drosophila-wing-${side}`, { radius: 0.62, tessellation: 32, sideOrientation: Mesh.DOUBLESIDE }, scene);
      membrane.parent = pivot;
      membrane.position.set(-0.42, 0, side * 0.24);
      membrane.scaling.set(1.55, 0.56, 1);
      membrane.rotation.x = Math.PI / 2;
      membrane.material = wing;
      this.wings.push(pivot);
    }

    [-0.28, 0.12, 0.48].forEach((x, row) => {
      for (const side of [-1, 1]) this.legs.push(this.createLeg(scene, x, side, row, limb));
    });
  }

  update(motor: MotorFrame, dt: number): void {
    this.gaitPhase += dt * (2.4 + motor.gait * 7.8);
    this.heading += motor.turn * dt * 1.25;
    const stride = (0.018 + motor.forward * 0.17) * dt;
    this.root.position.x += Math.cos(this.heading) * stride;
    this.root.position.z += Math.sin(this.heading) * stride;
    this.root.position.x = Math.max(-4.45, Math.min(4.45, this.root.position.x));
    this.root.position.z = Math.max(-3.85, Math.min(3.85, this.root.position.z));
    this.root.rotation.y = -this.heading;
    this.visual.position.y = Math.sin(this.gaitPhase * 2.1) * (0.014 + motor.gait * 0.018);
    const flap = Math.sin(this.gaitPhase * 12.5) * (0.22 + motor.wingLift * 0.7);
    this.wings.forEach((pivot, index) => {
      pivot.rotation.x = index ? -flap : flap;
      pivot.rotation.z = index ? -0.14 : 0.14;
    });
    this.legs.forEach(({ hip, knee, ankle, phase, side }) => {
      const swing = Math.sin(this.gaitPhase * 4.6 + phase) * (0.13 + motor.forward * 0.42);
      hip.rotation.z = side * (0.34 + swing);
      knee.rotation.z = side * (-0.52 + swing * 0.7);
      ankle.rotation.z = side * (0.46 - swing * 0.58);
    });
  }

  getPosition(): Vector3 { return this.root.position; }

  getHeading(): number { return this.heading; }

  reset(): void {
    this.root.position.set(-0.65, 0.24, -0.5);
    this.heading = 0.2;
    this.gaitPhase = 0;
    this.visual.position.y = 0;
    this.wings.forEach((pivot) => pivot.rotation.set(0, 0, 0));
    this.legs.forEach(({ hip, knee, ankle }) => {
      hip.rotation.set(0, 0, 0);
      knee.rotation.set(0, 0, 0);
      ankle.rotation.set(0, 0, 0);
    });
  }

  setEnabled(enabled: boolean): void {
    this.root.setEnabled(enabled);
    this.visual.setEnabled(enabled);
  }

  private createLeg(scene: Scene, x: number, side: number, row: number, material: StandardMaterial): LegRig {
    const hip = new TransformNode(`drosophila-leg-hip-${row}-${side}`, scene);
    hip.parent = this.visual;
    hip.position.set(x, 0.08, side * 0.34);
    const upper = MeshBuilder.CreateCylinder(`drosophila-leg-femur-${row}-${side}`, { diameter: 0.055, height: 0.42, tessellation: 8 }, scene);
    upper.parent = hip;
    upper.position.y = -0.21;
    upper.material = material;
    const knee = new TransformNode(`drosophila-leg-knee-${row}-${side}`, scene);
    knee.parent = hip;
    knee.position.y = -0.4;
    const lower = MeshBuilder.CreateCylinder(`drosophila-leg-tibia-${row}-${side}`, { diameter: 0.043, height: 0.38, tessellation: 8 }, scene);
    lower.parent = knee;
    lower.position.y = -0.19;
    lower.material = material;
    const ankle = new TransformNode(`drosophila-leg-ankle-${row}-${side}`, scene);
    ankle.parent = knee;
    ankle.position.y = -0.36;
    const foot = MeshBuilder.CreateCylinder(`drosophila-leg-tarsus-${row}-${side}`, { diameter: 0.025, height: 0.32, tessellation: 8 }, scene);
    foot.parent = ankle;
    foot.position.y = -0.16;
    foot.material = material;
    return { hip, knee, ankle, phase: row * 1.9 + (side > 0 ? 0 : Math.PI), side };
  }

  private material(scene: Scene, name: string, diffuse: string, emissive: string, specular: string, power: number): StandardMaterial {
    const material = new StandardMaterial(name, scene);
    material.diffuseColor = Color3.FromHexString(diffuse);
    material.emissiveColor = Color3.FromHexString(emissive);
    material.specularColor = Color3.FromHexString(specular);
    material.specularPower = power;
    return material;
  }
}
