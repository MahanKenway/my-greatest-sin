/** Luminous Connectome Lab: procedural body geometry responds only to labelled modelled motor commands. */
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { MotorFrame } from "@/game/shared/types";

export class FlyBody {
  private readonly root: TransformNode;
  private readonly wings: readonly [TransformNode, TransformNode];
  private readonly legLines = [] as ReturnType<typeof MeshBuilder.CreateLines>[];
  private heading = 0.2;
  private gaitPhase = 0;

  constructor(scene: Scene) {
    this.root = new TransformNode("drosophila-body", scene);
    this.root.position.set(-0.65, 0.26, -0.5);

    const bodyMaterial = new StandardMaterial("fly-cuticle", scene);
    bodyMaterial.diffuseColor = Color3.FromHexString("#283440");
    bodyMaterial.emissiveColor = Color3.FromHexString("#071018");
    const abdomenMaterial = new StandardMaterial("fly-abdomen", scene);
    abdomenMaterial.diffuseColor = Color3.FromHexString("#8A5C3E");
    abdomenMaterial.emissiveColor = Color3.FromHexString("#20130D");
    const eyeMaterial = new StandardMaterial("fly-eyes", scene);
    eyeMaterial.diffuseColor = Color3.FromHexString("#A43A48");
    eyeMaterial.emissiveColor = Color3.FromHexString("#44111B");

    const thorax = MeshBuilder.CreateSphere("fly-thorax", { diameter: 0.52, segments: 20 }, scene);
    thorax.scaling.set(1, 0.7, 1.18);
    thorax.parent = this.root;
    thorax.material = bodyMaterial;
    const abdomen = MeshBuilder.CreateSphere("fly-abdomen", { diameter: 0.48, segments: 20 }, scene);
    abdomen.scaling.set(0.75, 0.58, 1.36);
    abdomen.position.z = -0.38;
    abdomen.parent = this.root;
    abdomen.material = abdomenMaterial;
    const head = MeshBuilder.CreateSphere("fly-head", { diameter: 0.36, segments: 16 }, scene);
    head.scaling.set(1.12, 0.86, 1);
    head.position.z = 0.35;
    head.parent = this.root;
    head.material = bodyMaterial;
    for (const side of [-1, 1]) {
      const eye = MeshBuilder.CreateSphere("fly-compound-eye", { diameter: 0.17, segments: 16 }, scene);
      eye.scaling.set(0.75, 1.1, 1);
      eye.position.set(side * 0.17, 0.03, 0.42);
      eye.parent = this.root;
      eye.material = eyeMaterial;
    }

    const wingMaterial = new StandardMaterial("wing-membrane", scene);
    wingMaterial.diffuseColor = Color3.FromHexString("#D4E2E5");
    wingMaterial.emissiveColor = Color3.FromHexString("#263D45");
    wingMaterial.alpha = 0.62;
    const wingLeft = this.makeWing(scene, -1, wingMaterial);
    const wingRight = this.makeWing(scene, 1, wingMaterial);
    this.wings = [wingLeft, wingRight];

    const legMaterial = new StandardMaterial("fly-legs", scene);
    legMaterial.emissiveColor = Color3.FromHexString("#6DE5FF");
    for (let index = 0; index < 6; index += 1) {
      const side = index < 3 ? -1 : 1;
      const row = index % 3;
      const line = MeshBuilder.CreateLines("fly-leg", {
        points: [Vector3.Zero(), new Vector3(side * 0.35, -0.1, row * 0.24 - 0.24), new Vector3(side * 0.54, -0.25, row * 0.26 - 0.3)],
      }, scene);
      line.parent = this.root;
      line.color = Color3.FromHexString("#6DE5FF");
      this.legLines.push(line);
    }
  }

  update(motor: MotorFrame, dt: number): void {
    this.gaitPhase += dt * (2.1 + motor.gait * 6.2);
    this.heading += motor.turn * dt * 1.5;
    const stride = (0.12 + motor.forward * 0.72) * dt;
    this.root.position.x += Math.cos(this.heading) * stride;
    this.root.position.z += Math.sin(this.heading) * stride;
    this.root.position.x = Math.max(-4.45, Math.min(4.45, this.root.position.x));
    this.root.position.z = Math.max(-3.85, Math.min(3.85, this.root.position.z));
    this.root.rotation.y = Math.PI / 2 - this.heading;

    for (let index = 0; index < this.legLines.length; index += 1) {
      const leg = this.legLines[index];
      const phase = this.gaitPhase + (index % 2) * Math.PI;
      leg.rotation.z = Math.sin(phase + (index % 3) * 0.65) * 0.24;
    }
    this.wings[0].rotation.z = -0.32 - motor.wingLift * 0.75 + Math.sin(this.gaitPhase * 2) * motor.wingLift * 0.15;
    this.wings[1].rotation.z = 0.32 + motor.wingLift * 0.75 - Math.sin(this.gaitPhase * 2) * motor.wingLift * 0.15;
  }

  getPosition(): Vector3 {
    return this.root.position;
  }

  getHeading(): number {
    return this.heading;
  }

  reset(): void {
    this.root.position.set(-0.65, 0.26, -0.5);
    this.heading = 0.2;
    this.gaitPhase = 0;
  }

  private makeWing(scene: Scene, side: number, material: StandardMaterial): TransformNode {
    const pivot = new TransformNode("fly-wing-pivot", scene);
    pivot.parent = this.root;
    pivot.position.set(side * 0.18, 0.08, -0.03);
    const wing = MeshBuilder.CreatePlane("fly-wing", { width: 0.5, height: 0.95 }, scene);
    wing.rotation.x = Math.PI / 2;
    wing.position.set(side * 0.24, 0, -0.12);
    wing.parent = pivot;
    wing.material = material;
    return pivot;
  }
}
