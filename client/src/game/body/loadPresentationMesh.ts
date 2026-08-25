/** Luminous Connectome Lab: asynchronous GLB mounting cannot alter motor or neural state. */
import "@babylonjs/loaders/glTF";
import type { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import type { Material } from "@babylonjs/core/Materials/material";
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
