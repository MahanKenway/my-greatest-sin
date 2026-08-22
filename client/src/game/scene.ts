/**
 * Luminous Connectome Lab: the Babylon scene is a calibrated mineral-dark scientific canvas.
 * Source data, modelled mappings, and synthetic fixtures are supplied by framework-agnostic game modules.
 */
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import type { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { GameWorld } from "@/game/GameWorld";

export type GameHandle = {
  scene: Scene;
  world: GameWorld;
  dispose: () => void;
};

export async function createGameScene(
  engine: Engine,
  canvas: HTMLCanvasElement,
): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.027, 0.063, 0.094, 1);

  const camera = new ArcRotateCamera(
    "calibration-camera",
    -Math.PI / 2.45,
    0.84,
    10.9,
    new Vector3(0, 0.1, 0),
    scene,
  );
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 7;
  camera.upperRadiusLimit = 18;
  const ambient = new HemisphericLight("lab-ambient", new Vector3(0, 1, 0), scene);
  ambient.intensity = 0.64;
  ambient.diffuse.set(0.55, 0.72, 0.84);
  ambient.groundColor.set(0.035, 0.07, 0.1);
  const specimenLight = new PointLight("specimen-light", new Vector3(-2.2, 4.2, 2.6), scene);
  specimenLight.intensity = 22;
  specimenLight.diffuse.set(0.98, 0.67, 0.28);

  const world = new GameWorld(scene);
  scene.onBeforeRenderObservable.add(() => {
    world.update(Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05));
  });

  return {
    scene,
    world,
    dispose: () => {
      world.dispose();
      camera.detachControl();
      scene.dispose();
    },
  };
}
