/** Luminous Connectome Lab: actual Apache-2.0 NeuroMechFly geometry, with only presentation-labelled motor motion. */
import { Axis } from "@babylonjs/core/Maths/math.axis";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { MotorFrame } from "@/game/shared/types";
import { loadPresentationMesh } from "./loadPresentationMesh";
import { SPECIMEN_PRESENTATION_ASSETS } from "./presentationAssets";
import type { BodyController } from "./types";

type JointRig = Readonly<{ node: TransformNode; rest: Quaternion }>;

const LEG_PREFIXES = ["LF", "LM", "LH", "RF", "RM", "RH"] as const;
const LEG_SEGMENTS = ["Coxa", "Femur", "Tibia", "Tarsus1", "Tarsus2", "Tarsus3", "Tarsus4", "Tarsus5"] as const;

export class FlyBody implements BodyController {
  private readonly root: TransformNode;
  private readonly visual: TransformNode;
  private readonly joints = new Map<string, JointRig>();
  private heading = 0.2;
  private gaitPhase = 0;

  constructor(scene: Scene) {
    this.root = new TransformNode("drosophila-neuromechfly-body", scene);
    this.root.position.set(0.48, 0.78, -0.38);
    const materials = this.createPresentationMaterials(scene);
    this.visual = loadPresentationMesh(
      scene,
      SPECIMEN_PRESENTATION_ASSETS.drosophila,
      this.root,
      "drosophila-neuromechfly-apache2-presentation",
      undefined,
      ({ meshes, transformNodes }) => {
        this.applyPresentationMaterials(meshes, materials);
        this.bindSourceJoints(meshes, transformNodes);
      },
    );
    this.visual.scaling.setAll(380);
    // NeuroMechFly publishes anatomical height on Z; this sign puts its legs toward the garden floor.
    this.visual.rotation.x = Math.PI / 2;
  }

  update(motor: MotorFrame, dt: number): void {
    this.gaitPhase += dt * (2.4 + motor.gait * 7.8);
    this.heading += motor.turn * dt * 1.25;
    const stride = (0.018 + motor.forward * 0.17) * dt;
    this.root.position.x = Math.max(-4.45, Math.min(4.45, this.root.position.x + Math.cos(this.heading) * stride));
    this.root.position.z = Math.max(-3.85, Math.min(3.85, this.root.position.z + Math.sin(this.heading) * stride));
    this.root.rotation.y = -this.heading;
    this.visual.position.y = Math.sin(this.gaitPhase * 2.1) * (0.014 + motor.gait * 0.018);

    const flap = Math.sin(this.gaitPhase * 12.5) * (0.22 + motor.wingLift * 0.7);
    this.setJoint("LWing", Axis.Y, flap);
    this.setJoint("RWing", Axis.Y, -flap);
    this.setJoint("LHaltere", Axis.Y, -flap * 0.12);
    this.setJoint("RHaltere", Axis.Y, flap * 0.12);

    LEG_PREFIXES.forEach((prefix, index) => {
      const alternatingPhase = index % 2 === 0 ? 1 : -1;
      const swing = Math.sin(this.gaitPhase * 4.6 + index * 1.9) * (0.13 + motor.forward * 0.42) * alternatingPhase;
      this.setJoint(`${prefix}Coxa`, Axis.X, swing);
      this.setJoint(`${prefix}Femur`, Axis.X, -0.44 + swing * 0.7);
      this.setJoint(`${prefix}Tibia`, Axis.X, 0.36 - swing * 0.58);
    });
  }

  getPosition(): Vector3 { return this.root.position; }

  getHeading(): number { return this.heading; }

  reset(): void {
    this.root.position.set(0.48, 0.78, -0.38);
    this.heading = 0.2;
    this.gaitPhase = 0;
    this.visual.position.y = 0;
    for (const { node, rest } of Array.from(this.joints.values())) node.rotationQuaternion = rest.clone();
  }

  setEnabled(enabled: boolean): void {
    this.root.setEnabled(enabled);
  }

  private bindSourceJoints(meshes: readonly { name: string; setParent(parent: TransformNode): void }[], transformNodes: readonly TransformNode[]): void {
    const pivots = new Map(transformNodes.map((node) => [node.name, node]));
    for (const prefix of LEG_PREFIXES) {
      for (let index = 1; index < LEG_SEGMENTS.length; index += 1) {
        const child = pivots.get(`nmf_pivot__${prefix}${LEG_SEGMENTS[index]}`);
        const parent = pivots.get(`nmf_pivot__${prefix}${LEG_SEGMENTS[index - 1]}`);
        if (child && parent) child.setParent(parent);
      }
    }
    for (const mesh of meshes) {
      const jointName = mesh.name.replace(/^nmf__/, "");
      const pivot = pivots.get(`nmf_pivot__${jointName}`);
      if (pivot) mesh.setParent(pivot);
    }
    for (const [name, node] of Array.from(pivots.entries())) {
      if (!name.startsWith("nmf_pivot__")) continue;
      const joint = name.replace("nmf_pivot__", "");
      this.joints.set(joint, { node, rest: node.rotationQuaternion?.clone() ?? Quaternion.Identity() });
    }
  }

  private setJoint(name: string, axis: Vector3, angle: number): void {
    const joint = this.joints.get(name);
    if (!joint) return;
    joint.node.rotationQuaternion = joint.rest.multiply(Quaternion.RotationAxis(axis, angle));
  }

  private createPresentationMaterials(scene: Scene): Readonly<{ cuticle: StandardMaterial; eye: StandardMaterial; wing: StandardMaterial }> {
    const cuticle = new StandardMaterial("neuromechfly-cuticle-presentation", scene);
    cuticle.diffuseColor = Color3.FromHexString("#8E3B1A");
    cuticle.emissiveColor = Color3.FromHexString("#180805");
    cuticle.specularColor = Color3.FromHexString("#D89958");
    cuticle.specularPower = 44;

    const eye = new StandardMaterial("neuromechfly-compound-eye-presentation", scene);
    eye.diffuseColor = Color3.FromHexString("#3B0712");
    eye.emissiveColor = Color3.FromHexString("#150003");
    eye.specularColor = Color3.FromHexString("#E45A48");
    eye.specularPower = 76;

    const wing = new StandardMaterial("neuromechfly-wing-membrane-presentation", scene);
    wing.diffuseColor = Color3.FromHexString("#E8D4A7");
    wing.emissiveColor = Color3.FromHexString("#1A1508");
    wing.specularColor = Color3.FromHexString("#FFF0CF");
    wing.alpha = 0.72;
    wing.backFaceCulling = false;
    return { cuticle, eye, wing };
  }

  private applyPresentationMaterials(
    meshes: readonly Mesh[],
    materials: Readonly<{ cuticle: StandardMaterial; eye: StandardMaterial; wing: StandardMaterial }>,
  ): void {
    for (const mesh of meshes) {
      if (!mesh.name.startsWith("nmf__")) continue;
      mesh.material = /(?:LWing|RWing)/.test(mesh.name)
        ? materials.wing
        : /(?:LEye|REye)/.test(mesh.name)
          ? materials.eye
          : materials.cuticle;
    }
  }
}
