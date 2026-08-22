/** Luminous Connectome Lab: a lightweight C. elegans body with modelled motor-driven undulation. */
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { MotorFrame } from "@/game/shared/types";
import type { BodyController } from "./types";

const SEGMENT_COUNT = 15;

export class WormBody implements BodyController {
  private readonly root: TransformNode;
  private readonly segments: TransformNode[] = [];
  private heading = -1.2;
  private gaitPhase = 0;

  constructor(scene: Scene) {
    this.root = new TransformNode("c-elegans-body", scene);
    this.root.position.set(1.2, 0.18, 0.75);

    const cuticle = new StandardMaterial("worm-cuticle", scene);
    cuticle.diffuseColor = Color3.FromHexString("#7DAE88");
    cuticle.emissiveColor = Color3.FromHexString("#10291E");
    const headMaterial = new StandardMaterial("worm-head", scene);
    headMaterial.diffuseColor = Color3.FromHexString("#B5D9A8");
    headMaterial.emissiveColor = Color3.FromHexString("#1C3828");
    const nerveMaterial = new StandardMaterial("worm-nerve-ring", scene);
    nerveMaterial.diffuseColor = Color3.FromHexString("#8CEBFF");
    nerveMaterial.emissiveColor = Color3.FromHexString("#236276");

    for (let index = 0; index < SEGMENT_COUNT; index += 1) {
      const progress = index / (SEGMENT_COUNT - 1);
      const radius = 0.23 * (1 - progress * 0.48);
      const segment = MeshBuilder.CreateSphere("worm-body-segment", { diameter: 1, segments: 12 }, scene);
      segment.scaling.set(radius * 1.08, radius * 0.74, radius * 1.34);
      segment.position.z = 0.53 - index * 0.145;
      segment.parent = this.root;
      segment.material = index === 0 ? headMaterial : cuticle;
      this.segments.push(segment);
    }

    const nerveRing = MeshBuilder.CreateTorus("worm-nerve-ring", { diameter: 0.22, thickness: 0.025, tessellation: 20 }, scene);
    nerveRing.rotation.x = Math.PI / 2;
    nerveRing.position.z = 0.48;
    nerveRing.parent = this.root;
    nerveRing.material = nerveMaterial;
  }

  update(motor: MotorFrame, dt: number): void {
    this.gaitPhase += dt * (1.4 + motor.gait * 7.6);
    this.heading += motor.turn * dt * 1.18;
    const stride = (0.032 + motor.forward * 0.34) * dt;
    this.root.position.x += Math.cos(this.heading) * stride;
    this.root.position.z += Math.sin(this.heading) * stride;
    this.root.position.x = Math.max(-4.35, Math.min(4.35, this.root.position.x));
    this.root.position.z = Math.max(-3.65, Math.min(3.65, this.root.position.z));
    this.root.rotation.y = Math.PI / 2 - this.heading;

    const amplitude = 0.045 + motor.gait * 0.11;
    for (let index = 0; index < this.segments.length; index += 1) {
      const progress = index / (this.segments.length - 1);
      const segment = this.segments[index];
      const wave = Math.sin(this.gaitPhase - index * 0.62);
      segment.position.x = wave * amplitude * (0.32 + progress * 0.82);
      segment.position.y = 0.01 + Math.cos(this.gaitPhase - index * 0.51) * amplitude * 0.18;
      segment.rotation.y = wave * 0.16;
    }
  }

  getPosition() { return this.root.position; }

  getHeading() { return this.heading; }

  reset(): void {
    this.root.position.set(1.2, 0.18, 0.75);
    this.heading = -1.2;
    this.gaitPhase = 0;
    this.segments.forEach((segment, index) => {
      segment.position.set(0, 0, 0.53 - index * 0.145);
      segment.rotation.set(0, 0, 0);
    });
  }

  setEnabled(enabled: boolean): void { this.root.setEnabled(enabled); }
}
