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
  scene.autoClear = true;
  scene.autoClearDepthAndStencil = true;

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
  ambient.intensity = 0.3;
  ambient.diffuse.set(0.3, 0.42, 0.5);
  ambient.groundColor.set(0.02, 0.035, 0.05);
  const specimenLight = new PointLight("specimen-light", new Vector3(-2.2, 4.2, 2.6), scene);
  specimenLight.intensity = 5;
  specimenLight.diffuse.set(0.86, 0.58, 0.3);
  const gardenFill = new PointLight("garden-fill", new Vector3(-3.2, 2.1, 2.4), scene);
  gardenFill.intensity = 0.34;
  gardenFill.diffuse.set(0.18, 0.78, 0.61);
  const gardenRim = new PointLight("garden-rim", new Vector3(3.5, 2.6, -2.2), scene);
  gardenRim.intensity = 0.22;
  gardenRim.diffuse.set(0.84, 0.42, 0.25);

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
