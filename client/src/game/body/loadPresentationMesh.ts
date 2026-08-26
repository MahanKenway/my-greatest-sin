/** Luminous Connectome Lab: asynchronous GLB mounting cannot alter motor or neural state. */
import "@babylonjs/loaders/glTF";
import type { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import type { Material } from "@babylonjs/core/Materials/material";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";

export type PresentationMeshLoadResult = Readonly<{
  meshes: Mesh[];
  transformNodes: TransformNode[];
  animationGroups: AnimationGroup[];
}>;

export function loadPresentationMesh(
  scene: Scene,
  url: string,
  parent: TransformNode,
  name: string,
  material?: Material,
  onLoaded?: (result: PresentationMeshLoadResult) => void,
): TransformNode {
  const visual = new TransformNode(name, scene);
  visual.parent = parent;
  void SceneLoader.ImportMeshAsync("", "", url, scene)
    .then((result) => {
      for (const node of result.transformNodes) {
        if (node.parent === null) node.parent = visual;
      }
      for (const mesh of result.meshes) {
        if (mesh.parent === null) mesh.parent = visual;
        if (material) (mesh as Mesh).material = material;
        mesh.isPickable = false;
      }
      if (!material) useStablePresentationMaterials(scene, result.meshes as Mesh[], name);
      visual.setEnabled(parent.isEnabled());
      onLoaded?.({
        meshes: result.meshes as Mesh[],
        transformNodes: result.transformNodes,
        animationGroups: result.animationGroups,
      });
    })
    .catch(() => {
      // Presentation assets are optional for runtime continuity; no synthetic body substitute is introduced here.
    });
  return visual;
}

/**
 * The managed GLBs use PBR materials. StandardMaterial avoids a driver-specific
 * PBR readiness path in the browser preview while retaining each source color
 * and texture as presentation-only appearance.
 */
function useStablePresentationMaterials(scene: Scene, meshes: readonly Mesh[], prefix: string): void {
  const replacements = new Map<PBRMaterial, StandardMaterial>();
  for (const mesh of meshes) {
    if (!(mesh.material instanceof PBRMaterial)) continue;
    const original = mesh.material;
    let replacement = replacements.get(original);
    if (!replacement) {
      replacement = new StandardMaterial(`${prefix}-${original.name}-stable`, scene);
      replacement.diffuseColor = original.albedoColor.clone();
      replacement.emissiveColor = original.emissiveColor.clone();
      replacement.specularColor = Color3.Black();
      replacement.alpha = original.alpha;
      replacement.backFaceCulling = original.backFaceCulling;
      replacement.diffuseTexture = original.albedoTexture;
      replacement.emissiveTexture = original.emissiveTexture;
      replacements.set(original, replacement);
    }
    mesh.material = replacement;
  }
}
