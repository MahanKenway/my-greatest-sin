/** Luminous Connectome Lab: a single smooth C. elegans contour follows only labelled modelled motor commands. */
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { MotorFrame } from "@/game/shared/types";
import type { BodyController } from "./types";

export class WormBody implements BodyController {
  private readonly root: TransformNode;
  private readonly visual: TransformNode;
  private heading = 0.2;
  private gaitPhase = 0;

  constructor(scene: Scene) {
    this.root = new TransformNode("c-elegans-complete-body", scene);
    this.root.position.set(-0.15, 0.1, -0.35);
    const cuticle = new StandardMaterial("c-elegans-science-cuticle", scene);
    cuticle.diffuseColor = Color3.FromHexString("#D8A49C");
    cuticle.emissiveColor = Color3.FromHexString("#160A0A");
    cuticle.specularColor = Color3.FromHexString("#FFD9CF");
    cuticle.specularPower = 58;
    cuticle.backFaceCulling = false;
    this.visual = new TransformNode("c-elegans-contour-modelled-presentation", scene);
    this.visual.parent = this.root;
    const path = Array.from({ length: 42 }, (_, index) => {
      const t = index / 41;
      return new Vector3(
        -1.48 + t * 2.96,
        0.18 + Math.sin(t * Math.PI) * 0.055,
        Math.sin(t * Math.PI * 1.72) * 0.28 + Math.sin(t * Math.PI * 4.4) * 0.055,
      );
    });
    const body = MeshBuilder.CreateTube("c-elegans-modelled-contour-body", {
      path,
      radius: 0.14,
      tessellation: 18,
      cap: Mesh.CAP_ALL,
      radiusFunction: (index) => 0.04 + Math.sin((index / 41) * Math.PI) * 0.1,
    }, scene);
    body.material = cuticle;
    body.parent = this.visual;
    const head = MeshBuilder.CreateSphere("c-elegans-modelled-head", { diameter: 0.27, segments: 18 }, scene);
    head.position.copyFrom(path.at(-1)!);
    head.scaling.set(1.25, 0.95, 0.9);
    head.material = cuticle;
    head.parent = this.visual;
    const eyeMaterial = new StandardMaterial("c-elegans-modelled-eye", scene);
    eyeMaterial.diffuseColor = Color3.FromHexString("#2A1215");
    eyeMaterial.emissiveColor = Color3.FromHexString("#120407");
    for (const side of [-1, 1]) {
      const eye = MeshBuilder.CreateSphere(`c-elegans-modelled-eye-${side}`, { diameter: 0.035, segments: 10 }, scene);
      eye.position.copyFrom(path.at(-1)!);
      eye.position.addInPlace(new Vector3(0.08, 0.052, side * 0.075));
      eye.material = eyeMaterial;
      eye.parent = this.visual;
    }
    scene.onBeforeRenderObservable.add(() => {
      for (const mesh of [...scene.meshes]) {
        if (/^s\d+_/.test(mesh.name) || mesh.name.includes("wormtest1")) mesh.dispose(false, true);
      }
    });
  }

  update(motor: MotorFrame, dt: number): void {
    this.gaitPhase += dt * (1.4 + motor.gait * 7.6);
    this.heading += motor.turn * dt * 1.18;
    const stride = (0.008 + motor.forward * 0.08) * dt;
    this.root.position.x += Math.cos(this.heading) * stride;
    this.root.position.z += Math.sin(this.heading) * stride;
    this.root.position.x = Math.max(-4.35, Math.min(4.35, this.root.position.x));
    this.root.position.z = Math.max(-3.65, Math.min(3.65, this.root.position.z));
    this.root.rotation.y = Math.PI / 2 - this.heading;
    const amplitude = 0.025 + motor.gait * 0.075;
    this.visual.rotation.z = Math.sin(this.gaitPhase) * amplitude;
    this.visual.position.y = Math.cos(this.gaitPhase * 1.35) * amplitude * 0.22;
  }

  getPosition(): Vector3 { return this.root.position; }

  getHeading(): number { return this.heading; }

  reset(): void {
    this.root.position.set(-0.15, 0.1, -0.35);
    this.heading = 0.2;
    this.gaitPhase = 0;
    this.visual.rotation.z = 0;
    this.visual.position.y = 0;
  }

  setEnabled(enabled: boolean): void {
    this.root.setEnabled(enabled);
    this.visual.setEnabled(enabled);
  }
}
