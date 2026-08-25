/** Luminous Connectome Lab: asynchronous GLB mounting cannot alter motor or neural state. */
import "@babylonjs/loaders/glTF";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import type { Material } from "@babylonjs/core/Materials/material";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";

export function loadPresentationMesh(
  scene: Scene,
  url: string,
  parent: TransformNode,
  name: string,
  material?: Material,
  onLoaded?: (meshes: Mesh[]) => void,
): TransformNode {
  const visual = new TransformNode(name, scene);
  visual.parent = parent;
  void SceneLoader.ImportMeshAsync("", "", url, scene)
    .then((result) => {
      for (const mesh of result.meshes) {
        if (mesh.parent === null) mesh.parent = visual;
        if (material) (mesh as Mesh).material = material;
        mesh.isPickable = false;
      }
      visual.setEnabled(parent.isEnabled());
      onLoaded?.(result.meshes as Mesh[]);
    })
    .catch(() => {
      // Presentation assets are optional for runtime continuity; no synthetic body substitute is introduced here.
    });
  return visual;
}
