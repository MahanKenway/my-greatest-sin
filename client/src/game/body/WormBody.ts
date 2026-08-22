/** Luminous Connectome Lab: a compact full-body GLB follows only labelled modelled motor commands. */
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { MotorFrame } from "@/game/shared/types";
import { loadPresentationMesh } from "./loadPresentationMesh";
import { SPECIMEN_PRESENTATION_ASSETS } from "./presentationAssets";
import type { BodyController } from "./types";

export class WormBody implements BodyController {
  private readonly root: TransformNode;
  private readonly visual: TransformNode;
  private heading = -1.2;
  private gaitPhase = 0;

  constructor(scene: Scene) {
    this.root = new TransformNode("c-elegans-complete-body", scene);
    this.root.position.set(1.2, 0.2, 0.75);
    const cuticle = new StandardMaterial("c-elegans-glb-cuticle", scene);
    cuticle.diffuseColor = Color3.FromHexString("#C9B09D");
    cuticle.emissiveColor = Color3.FromHexString("#2A1A17");
    cuticle.specularColor = Color3.FromHexString("#514038");
    cuticle.backFaceCulling = false;
    this.visual = loadPresentationMesh(scene, SPECIMEN_PRESENTATION_ASSETS.worm, this.root, "c-elegans-openworm-informed-presentation", cuticle);
    this.visual.rotation.y = Math.PI / 2;
    this.visual.scaling.setAll(0.92);
    this.visual.position.y = 0.08;
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
    const amplitude = 0.025 + motor.gait * 0.075;
    this.visual.rotation.z = Math.sin(this.gaitPhase) * amplitude;
    this.visual.position.y = 0.08 + Math.cos(this.gaitPhase * 1.35) * amplitude * 0.22;
  }

  getPosition(): Vector3 { return this.root.position; }

  getHeading(): number { return this.heading; }

  reset(): void {
    this.root.position.set(1.2, 0.2, 0.75);
    this.heading = -1.2;
    this.gaitPhase = 0;
    this.visual.rotation.z = 0;
    this.visual.position.y = 0.08;
  }

  setEnabled(enabled: boolean): void {
    this.root.setEnabled(enabled);
    this.visual.setEnabled(enabled);
  }
}
