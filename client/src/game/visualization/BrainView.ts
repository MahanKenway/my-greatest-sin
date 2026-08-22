/** Luminous Connectome Lab: sampled thin instances visualize activity without per-neuron DOM or mesh proliferation. */
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import type { ConnectomeColumns } from "@/game/shared/types";

export class BrainView {
  private readonly cloud;
  private readonly matrices: Float32Array;
  private readonly material: StandardMaterial;
  private peak = 0;

  constructor(scene: Scene, columns: ConnectomeColumns) {
    this.cloud = MeshBuilder.CreateIcoSphere("sampled-neuron-cloud", { radius: 0.055, subdivisions: 1 }, scene);
    this.cloud.position.set(-3.2, 1.15, -2.7);
    this.material = new StandardMaterial("brain-sample-material", scene);
    this.material.diffuseColor = Color3.FromHexString("#E8F0EE");
    this.material.emissiveColor = Color3.FromHexString("#2B1130");
    this.cloud.material = this.material;
    this.matrices = new Float32Array(columns.neuronCount * 16);
    const matrix = Matrix.Identity();
    for (let neuron = 0; neuron < columns.neuronCount; neuron += 1) {
      const offset = neuron * 3;
      const point = new Vector3(columns.positions[offset], columns.positions[offset + 1], columns.positions[offset + 2]);
      Matrix.Translation(point.x, point.y, point.z).copyToArray(this.matrices, neuron * 16);
      matrix.copyFrom(Matrix.Identity());
    }
    this.cloud.thinInstanceSetBuffer("matrix", this.matrices, 16, true);
  }

  update(firingRate: Float32Array, timeSeconds: number): void {
    let sum = 0;
    for (let index = 0; index < firingRate.length; index += 1) sum += firingRate[index];
    this.peak = Math.max(this.peak * 0.985, sum / Math.max(1, firingRate.length));
    const activity = Math.min(1, this.peak * 8);
    this.material.emissiveColor = Color3.Lerp(Color3.FromHexString("#28112D"), Color3.FromHexString("#FF3D8D"), activity);
    this.cloud.rotation.y = timeSeconds * 0.11;
  }

  dispose(): void {
    this.cloud.dispose();
    this.material.dispose();
  }
}
