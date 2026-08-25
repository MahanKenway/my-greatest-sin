/** Luminous Connectome Lab: a CC BY 4.0 wildtype-female GLB follows only labelled modelled motor commands. */
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { MotorFrame } from "@/game/shared/types";
import { loadPresentationMesh } from "./loadPresentationMesh";
import { SPECIMEN_PRESENTATION_ASSETS } from "./presentationAssets";
import type { BodyController } from "./types";

export class FlyBody implements BodyController {
  private readonly root: TransformNode;
  private readonly visual: TransformNode;
  private heading = 0.2;
  private gaitPhase = 0;

  constructor(scene: Scene) {
    this.root = new TransformNode("drosophila-complete-body", scene);
    this.root.position.set(-0.65, 0.2, -0.5);
    const cuticle = new StandardMaterial("drosophila-wildtype-cuticle", scene);
    cuticle.diffuseColor = Color3.FromHexString("#6C513B");
    cuticle.emissiveColor = Color3.FromHexString("#0A0705");
    cuticle.specularColor = Color3.FromHexString("#7E674D");
    cuticle.specularPower = 24;
    cuticle.backFaceCulling = false;
    this.visual = loadPresentationMesh(scene, SPECIMEN_PRESENTATION_ASSETS.fly, this.root, "drosophila-wildtype-presentation", cuticle);
    this.visual.rotation.x = -Math.PI / 2;
    this.visual.scaling.setAll(0.16);
    this.visual.position.y = 0.11;
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
    this.visual.position.y = 0.11 + Math.sin(this.gaitPhase * 2) * (0.006 + motor.gait * 0.016);
    this.visual.rotation.z = Math.sin(this.gaitPhase * 2.1) * motor.wingLift * 0.045;
  }

  getPosition(): Vector3 { return this.root.position; }

  getHeading(): number { return this.heading; }

  reset(): void {
    this.root.position.set(-0.65, 0.2, -0.5);
    this.heading = 0.2;
    this.gaitPhase = 0;
    this.visual.position.y = 0.11;
    this.visual.rotation.z = 0;
  }

  setEnabled(enabled: boolean): void {
    this.root.setEnabled(enabled);
    this.visual.setEnabled(enabled);
  }
}
