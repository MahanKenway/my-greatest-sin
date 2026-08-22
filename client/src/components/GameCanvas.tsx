/**
 * Luminous Connectome Lab: React is the picture frame; Babylon owns the live scientific canvas.
 * This component intentionally contains no simulation state or UI state.
 */
import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { cacheManifestChunks, inspectRemotePack } from "@/game/connectome/loader";
import { createGameScene, type GameHandle } from "@/game/scene";
import type { DflyPackStatus, SimulationCommand, SimulationSnapshot } from "@/game/shared/types";
import SimulationHud from "./SimulationHud";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const handleRef = useRef<GameHandle | null>(null);
  const [snapshot, setSnapshot] = useState<SimulationSnapshot | null>(null);
  const [packStatus, setPackStatus] = useState<DflyPackStatus>({ state: "UNCONFIGURED", message: "No DFLY manifest has been selected." });
  const [packUrl, setPackUrl] = useState<string | null>(null);
  const [cacheProgress, setCacheProgress] = useState<{ completed: number; total: number } | null>(null);

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
      const requestedPack = new URLSearchParams(window.location.search).get("pack");
      if (requestedPack) {
        setPackUrl(requestedPack);
        void inspectRemotePack(requestedPack).then(setPackStatus);
      }
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
  const configurePack = () => {
    const enteredUrl = window.prompt("Paste the CORS-enabled URL of a DFLY manifest.json file.");
    if (!enteredUrl) return;
    try {
      const normalizedUrl = new URL(enteredUrl).toString();
      setPackUrl(normalizedUrl);
      setPackStatus({ state: "UNCONFIGURED", message: "Inspecting DFLY manifest provenance and browser limits…" });
      void inspectRemotePack(normalizedUrl).then(setPackStatus);
    } catch {
      setPackStatus({ state: "ERROR", message: "The DFLY manifest URL is not valid." });
    }
  };
  const cachePack = () => {
    if (!packUrl || (packStatus.state !== "VALIDATED" && packStatus.state !== "CACHED")) return;
    setCacheProgress({ completed: 0, total: packStatus.manifest.chunks.length });
    void cacheManifestChunks(packUrl, packStatus.manifest, (completed, total) => setCacheProgress({ completed, total }))
      .then(() => inspectRemotePack(packUrl))
      .then(setPackStatus)
      .catch((error: unknown) => setPackStatus({ state: "ERROR", message: error instanceof Error ? error.message : "Unable to cache DFLY chunks." }))
      .finally(() => setCacheProgress(null));
  };

  return <main className="digital-fly-shell">
    <canvas ref={canvasRef} className="lab-canvas" aria-label="Digital Fly live simulation canvas" />
    <svg className="axon-overlay" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true"><path d="M122 266C270 270 344 352 522 436S750 614 927 572" /><path d="M169 314C318 332 406 409 571 446S804 561 1095 422" /></svg>
    <SimulationHud snapshot={snapshot} onCommand={onCommand} packStatus={packStatus} cacheProgress={cacheProgress} onConfigurePack={configurePack} onCachePack={cachePack} />
  </main>;
}
