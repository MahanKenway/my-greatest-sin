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
  private body: Mesh;
  private readonly head: Mesh;
  private readonly eyes: Mesh[] = [];
  private heading = 0.2;
  private gaitPhase = 0;

  constructor(private readonly scene: Scene) {
    this.root = new TransformNode("c-elegans-complete-body", scene);
    this.root.position.set(-0.15, 0.1, -0.35);
    const cuticle = new StandardMaterial("c-elegans-science-cuticle", scene);
    cuticle.diffuseColor = Color3.FromHexString("#26090C");
    cuticle.emissiveColor = Color3.Black();
    cuticle.specularColor = Color3.Black();
    cuticle.backFaceCulling = false;
    this.visual = new TransformNode("c-elegans-contour-modelled-presentation", scene);
    this.visual.parent = this.root;
    const path = this.makePath(0);
    this.body = MeshBuilder.CreateTube("c-elegans-modelled-contour-body", {
      path,
      radius: 0.14,
      tessellation: 18,
      cap: Mesh.CAP_ALL,
      radiusFunction: (index) => 0.04 + Math.sin((index / 41) * Math.PI) * 0.1,
    }, scene);
    this.body.material = cuticle;
    this.body.parent = this.visual;
    this.head = MeshBuilder.CreateSphere("c-elegans-modelled-head", { diameter: 0.27, segments: 18 }, scene);
    this.head.position.copyFrom(path.at(-1)!);
    this.head.scaling.set(1.25, 0.95, 0.9);
    this.head.material = cuticle;
    this.head.parent = this.visual;
    const eyeMaterial = new StandardMaterial("c-elegans-modelled-eye", scene);
    eyeMaterial.diffuseColor = Color3.FromHexString("#2A1215");
    eyeMaterial.emissiveColor = Color3.FromHexString("#120407");
    for (const side of [-1, 1]) {
      const eye = MeshBuilder.CreateSphere(`c-elegans-modelled-eye-${side}`, { diameter: 0.035, segments: 10 }, scene);
      eye.position.copyFrom(path.at(-1)!);
      eye.position.addInPlace(new Vector3(0.08, 0.052, side * 0.075));
      eye.material = eyeMaterial;
      eye.parent = this.visual;
      this.eyes.push(eye);
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
    this.root.rotation.y = -this.heading;
    const path = this.makePath(this.gaitPhase);
    this.body = MeshBuilder.CreateTube("c-elegans-modelled-contour-body", {
      path,
      radius: 0.14,
      tessellation: 18,
      cap: Mesh.CAP_ALL,
      radiusFunction: (index) => 0.04 + Math.sin((index / 41) * Math.PI) * 0.1,
      instance: this.body,
    }, this.scene);
    this.body.parent = this.visual;
    this.head.position.copyFrom(path.at(-1)!);
    const head = path.at(-1)!;
    this.eyes.forEach((eye, index) => {
      eye.position.copyFrom(head);
      eye.position.addInPlace(new Vector3(0.08, 0.052, index ? 0.075 : -0.075));
    });
    this.visual.position.y = 0;
  }

  getPosition(): Vector3 { return this.root.position; }

  getHeading(): number { return this.heading; }

  reset(): void {
    this.root.position.set(-0.15, 0.1, -0.35);
    this.heading = 0.2;
    this.gaitPhase = 0;
    this.visual.position.y = 0;
  }

  setEnabled(enabled: boolean): void {
    this.root.setEnabled(enabled);
    this.visual.setEnabled(enabled);
  }

  private makePath(phase: number): Vector3[] {
    return Array.from({ length: 42 }, (_, index) => {
      const t = index / 41;
      const envelope = Math.sin(t * Math.PI);
      return new Vector3(
        -1.48 + t * 2.96,
        0.18 + envelope * 0.055,
        Math.sin(t * Math.PI * 3.15 - phase * 2.7) * envelope * 0.22,
      );
    });
  }
}
