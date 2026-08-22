/**
 * Luminous Connectome Lab: React is the picture frame; Babylon owns the live scientific canvas.
 * This component intentionally contains no simulation state or UI state.
 */
import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";
import type { SimulationCommand, SimulationSnapshot } from "@/game/shared/types";
import SimulationHud from "./SimulationHud";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const handleRef = useRef<GameHandle | null>(null);
  const [snapshot, setSnapshot] = useState<SimulationSnapshot | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;

    startedRef.current = true;
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    });

    let handle: GameHandle | null = null;
    let unsubscribe: (() => void) | null = null;
    let disposed = false;

    createGameScene(engine, canvas).then((sceneHandle) => {
      if (disposed) {
        sceneHandle.dispose();
        return;
      }

      handle = sceneHandle;
      handleRef.current = sceneHandle;
      if (new URLSearchParams(window.location.search).has("demo")) {
        sceneHandle.world.command({ type: "demo" });
      }
      unsubscribe = sceneHandle.world.subscribe((nextSnapshot) => {
        if (!disposed) setSnapshot(nextSnapshot);
      });
      engine.runRenderLoop(() => sceneHandle.scene.render());
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      engine.stopRenderLoop();
      unsubscribe?.();
      handle?.dispose();
      handleRef.current = null;
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  const onCommand = (command: SimulationCommand) => handleRef.current?.world.command(command);

  return <main className="digital-fly-shell">
    <canvas ref={canvasRef} className="lab-canvas" aria-label="Digital Fly live simulation canvas" />
    <svg className="axon-overlay" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true"><path d="M122 266C270 270 344 352 522 436S750 614 927 572" /><path d="M169 314C318 332 406 409 571 446S804 561 1095 422" /></svg>
    <SimulationHud snapshot={snapshot} onCommand={onCommand} />
  </main>;
}
