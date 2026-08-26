/** Natural specimen: visual smoothing only; translation, turn and body wave consume the decoded C. elegans MotorFrame without autonomous steering. */
import type { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { MotorFrame } from "@/game/shared/types";
import { CELEGANS_DECODER_CALIBRATION } from "@/game/neural/celegansCalibration";
import { loadPresentationMesh } from "./loadPresentationMesh";
import { SPECIMEN_PRESENTATION_ASSETS } from "./presentationAssets";
import type { BodyController } from "./types";

export class WormBody implements BodyController {
  private readonly root: TransformNode;
  private readonly visual: TransformNode;
  private wave?: AnimationGroup;
  private heading = 0.2;
  private gaitPhase = 0;
  private smoothedForward = 0;
  private smoothedTurn = 0;
  private smoothedGait = 0;

  constructor(scene: Scene) {
    this.root = new TransformNode("c-elegans-modelled-continuous-body", scene);
    this.root.position.set(0.32, 0.18, -0.28);
    this.visual = loadPresentationMesh(
      scene,
      SPECIMEN_PRESENTATION_ASSETS.celegans,
      this.root,
      "c-elegans-modelled-continuous-presentation",
      undefined,
      ({ animationGroups }) => {
        this.wave = animationGroups.find((group) => group.name.includes("MODELLED_C_ELEGANS_BODY_WAVE"));
        this.wave?.start(true, 1.15);
        if (this.wave) {
          this.wave.speedRatio = 0;
          this.wave.setWeightForAllAnimatables(0);
        }
      },
    );
    this.visual.scaling.setAll(0.44);
    // The handcrafted body's broader head is authored on -X. This half-turn
    // maps the real silhouette's head to the root's forward +X direction.
    this.visual.rotation.y = Math.PI;
  }

  update(motor: MotorFrame, dt: number): void {
    const steeringBlend = 1 - Math.exp(-dt * 5.2);
    const strideBlend = 1 - Math.exp(-dt * 3.6);
    this.smoothedTurn += (motor.turn - this.smoothedTurn) * steeringBlend;
    this.smoothedForward += (motor.forward - this.smoothedForward) * strideBlend;
    this.smoothedGait += (motor.gait - this.smoothedGait) * strideBlend;
    this.gaitPhase += dt * (this.smoothedGait * 6.8);
    this.heading += this.smoothedTurn * dt * CELEGANS_DECODER_CALIBRATION.continuousCurveRadiansPerSecondAtFullDrive;
    const stride = this.smoothedForward <= 0.002 ? 0 : this.smoothedForward * CELEGANS_DECODER_CALIBRATION.gardenStrideUnitsPerSecondAtFullDrive * dt;
    this.root.position.x = Math.max(-4.35, Math.min(4.35, this.root.position.x + Math.cos(this.heading) * stride));
    this.root.position.z = Math.max(-3.65, Math.min(3.65, this.root.position.z + Math.sin(this.heading) * stride));
    this.root.rotation.y = -this.heading;
    this.visual.position.y = Math.sin(this.gaitPhase * 1.7) * 0.008;
    if (this.wave) {
      const waveStrength = Math.max(0, Math.min(1, this.smoothedGait));
      this.wave.speedRatio = waveStrength > 0.002 ? 0.16 + waveStrength * 2.35 : 0;
      this.wave.setWeightForAllAnimatables(waveStrength);
    }
  }

  getPosition(): Vector3 { return this.root.position; }

  getHeading(): number { return this.heading; }

  reset(): void {
    this.root.position.set(0.32, 0.18, -0.28);
    this.heading = 0.2;
    this.gaitPhase = 0;
    this.smoothedForward = 0;
    this.smoothedTurn = 0;
    this.smoothedGait = 0;
    this.visual.position.y = 0;
  }

  setEnabled(enabled: boolean): void {
    this.root.setEnabled(enabled);
    this.visual.setEnabled(enabled);
    if (enabled) this.wave?.play(true);
    else this.wave?.pause();
  }
}
