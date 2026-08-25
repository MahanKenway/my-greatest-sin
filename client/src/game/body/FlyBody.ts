/** Natural specimen: Apache-2.0 FlyBody geometry + MODELLED MAPPING gait only. */
import { Axis } from "@babylonjs/core/Maths/math.axis";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { MotorFrame } from "@/game/shared/types";
import { loadPresentationMesh } from "./loadPresentationMesh";
import { SPECIMEN_PRESENTATION_ASSETS } from "./presentationAssets";
import type { BodyController } from "./types";

type JointRig = Readonly<{ node: TransformNode; rest: Quaternion }>;

const LEGS = [
  ["coxa_T1_left", "femur_T1_left", "tibia_T1_left"],
  ["coxa_T2_left", "femur_T2_left", "tibia_T2_left"],
  ["coxa_T3_left", "femur_T3_left", "tibia_T3_left"],
  ["coxa_T1_right", "femur_T1_right", "tibia_T1_right"],
  ["coxa_T2_right", "femur_T2_right", "tibia_T2_right"],
  ["coxa_T3_right", "femur_T3_right", "tibia_T3_right"],
] as const;

export class FlyBody implements BodyController {
  private readonly root: TransformNode;
  private readonly visual: TransformNode;
  private readonly joints = new Map<string, JointRig>();
  private heading = 0.2;
  private gaitPhase = 0;

  constructor(scene: Scene) {
    this.root = new TransformNode("drosophila-flybody-body", scene);
    this.root.position.set(0.48, 0.72, -0.38);
    this.visual = loadPresentationMesh(
      scene,
      SPECIMEN_PRESENTATION_ASSETS.drosophila,
      this.root,
      "drosophila-flybody-apache2-presentation",
      undefined,
      ({ transformNodes }) => this.bindSourceJoints(transformNodes),
    );
    this.visual.scaling.setAll(0.58);
    // FlyBody's inspected head is on source -X. This half-turn maps it to the
    // controller's forward +X direction while preserving the source up axis.
    this.visual.rotation.y = Math.PI;
  }

  update(motor: MotorFrame, dt: number): void {
    this.gaitPhase += dt * (2.2 + motor.gait * 7.4);
    this.heading += motor.turn * dt * 1.25;
    const stride = (0.06 + motor.forward * 0.48) * dt;
    this.root.position.x = Math.max(-4.45, Math.min(4.45, this.root.position.x + Math.cos(this.heading) * stride));
    this.root.position.z = Math.max(-3.85, Math.min(3.85, this.root.position.z + Math.sin(this.heading) * stride));
    this.root.rotation.y = -this.heading;
    this.visual.position.y = Math.sin(this.gaitPhase * 2.05) * (0.010 + motor.gait * 0.016);

    const flap = Math.sin(this.gaitPhase * 15.5) * (0.16 + motor.wingLift * 0.56);
    this.setJoint("wing_left", Axis.X, flap);
    this.setJoint("wing_right", Axis.X, -flap);
    this.setJoint("haltere_left", Axis.X, -flap * 0.16);
    this.setJoint("haltere_right", Axis.X, flap * 0.16);

    LEGS.forEach(([coxa, femur, tibia], index) => {
      const tripod = index % 2 === 0 ? 1 : -1;
      const swing = Math.sin(this.gaitPhase * 4.8 + index * 1.84) * (0.075 + motor.forward * 0.30) * tripod;
      // Small rotations around published FlyBody joint pivots. This remains
      // presentation-only motion, never a FlyWire-derived locomotion claim.
      this.setJoint(coxa, Axis.Y, swing);
      this.setJoint(femur, Axis.Y, -swing * 0.54);
      this.setJoint(tibia, Axis.Y, swing * 0.42);
    });
  }

  getPosition(): Vector3 { return this.root.position; }

  getHeading(): number { return this.heading; }

  reset(): void {
    this.root.position.set(0.48, 0.72, -0.38);
    this.heading = 0.2;
    this.gaitPhase = 0;
    this.visual.position.y = 0;
    for (const { node, rest } of Array.from(this.joints.values())) node.rotationQuaternion = rest.clone();
  }

  setEnabled(enabled: boolean): void {
    this.root.setEnabled(enabled);
  }

  private bindSourceJoints(transformNodes: readonly TransformNode[]): void {
    for (const node of transformNodes) {
      if (!node.name.startsWith("fb_pivot__")) continue;
      const joint = node.name.replace("fb_pivot__", "");
      this.joints.set(joint, { node, rest: node.rotationQuaternion?.clone() ?? Quaternion.Identity() });
    }
  }

  private setJoint(name: string, axis: Vector3, angle: number): void {
    const joint = this.joints.get(name);
    if (!joint) return;
    joint.node.rotationQuaternion = joint.rest.multiply(Quaternion.RotationAxis(axis, angle));
  }
}
