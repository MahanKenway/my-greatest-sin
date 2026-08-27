/**
 * Luminous Connectome Lab: React is the picture frame; Babylon owns the live scientific canvas.
 * This component intentionally contains no simulation state or UI state.
 */
import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { EngineStore } from "@babylonjs/core/Engines/engineStore";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { cacheManifestChunks, inspectRemotePack } from "@/game/connectome/loader";
import { inspectOfficialFlywireStage } from "@/game/connectome/flywireStage";
import { runFlywireWebGpuBenchmark, type FlywireWebGpuBenchmark } from "@/game/connectome/flywireWebGpuBenchmark";
import { decodeMn9StructuralScoreForProboscis, runSugarMn9Pilot, type SugarMn9PilotResult } from "@/game/connectome/sugarMn9PilotRuntime";
import { DEFAULT_SUGAR_MN9_PILOT_PROTOCOL, type SugarMn9InputAblation } from "@/game/connectome/sugarMn9Pilot";
import { runBoundedCpuSugarCorridor, type BoundedCpuCorridorResult } from "@/game/connectome/boundedCpuCorridor";
import { DEFAULT_FLYWIRE_LIF_SETTINGS, preflightFlywireSiteLevelLif, type FlywireLifSettings, type FlywireSiteLevelLifReadiness } from "@/game/connectome/flywireSiteLevelLif";
import { createGameScene, type GameHandle } from "@/game/scene";
import type { DflyPackStatus, FlywireStageStatus, SimulationCommand, SimulationSnapshot } from "@/game/shared/types";
import { commandForSimulationShortcut } from "@/game/simulationShortcuts";
import SimulationHud from "./SimulationHud";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const handleRef = useRef<GameHandle | null>(null);
  const cpuAbortRef = useRef<AbortController | null>(null);
  const [snapshot, setSnapshot] = useState<SimulationSnapshot | null>(null);
  const [packStatus, setPackStatus] = useState<DflyPackStatus>({ state: "UNCONFIGURED", message: "No DFLY manifest has been selected." });
  const [packUrl, setPackUrl] = useState<string | null>(null);
  const [cacheProgress, setCacheProgress] = useState<{ completed: number; total: number } | null>(null);
  const [flywireStage] = useState<FlywireStageStatus>(() => inspectOfficialFlywireStage());
  const [benchmark, setBenchmark] = useState<{ state: "IDLE" | "RUNNING" | "MEASURED" | "ERROR"; message: string; result?: FlywireWebGpuBenchmark }>({ state: "IDLE", message: "No official WebGPU measurement has run in this browser session." });
  const [pilot, setPilot] = useState<{ state: "IDLE" | "RUNNING" | "MEASURED" | "ERROR"; message: string; result?: SugarMn9PilotResult }>({ state: "IDLE", message: "The selected pilot is armed but cannot run until a verified WebGPU adapter is available." });
  const [cpuCorridor, setCpuCorridor] = useState<{ state: "IDLE" | "RUNNING" | "MEASURED" | "ERROR"; message: string; result?: BoundedCpuCorridorResult }>({ state: "IDLE", message: "No bounded CPU corridor validation has run in this browser session." });
  const [pilotProtocol, setPilotProtocol] = useState(() => ({ ...DEFAULT_SUGAR_MN9_PILOT_PROTOCOL }));
  const [lifSettings, setLifSettings] = useState<FlywireLifSettings>(DEFAULT_FLYWIRE_LIF_SETTINGS);
  const [lifReadiness, setLifReadiness] = useState<FlywireSiteLevelLifReadiness>({ state: "IDLE", stage: "NONE", message: "Site-level sign/weight LIF has not been checked in this browser session." });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;

    for (const existingEngine of [...EngineStore.Instances]) {
      if (existingEngine.getRenderingCanvas() === canvas) existingEngine.dispose();
    }
    startedRef.current = true;
    const engine = new Engine(canvas, true, {
      // Keep the WebGL frame available for review screenshots of public specimen assets.
      alpha: true,
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
      engine.runRenderLoop(() => {
        engine.clear(new Color4(0.027, 0.063, 0.094, 0), true, true, true);
        sceneHandle.scene.render();
      });
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cpuAbortRef.current?.abort();
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
  const runOfficialBenchmark = () => {
    if (benchmark.state === "RUNNING") return;
    if (!packUrl || (packStatus.state !== "VALIDATED" && packStatus.state !== "CACHED")) {
      setBenchmark({ state: "ERROR", message: "Select and validate a CORS-enabled checksum-verified DFLY manifest before any full-pack WebGPU download. The public app does not ship the 163 MiB pack." });
      return;
    }
    setBenchmark({ state: "RUNNING", message: "Checking the WebGPU adapter and storage limits before fetching any checksum-verified v783 CSR columns. This does not activate FlyWire or body control." });
    void runFlywireWebGpuBenchmark(packUrl)
      .then((result) => setBenchmark({ state: "MEASURED", result, message: `Measured ${result.meanStepMs.toFixed(2)} ms per sparse step across ${result.edgeCount.toLocaleString()} proofread connections.` }))
      .catch((error: unknown) => setBenchmark({ state: "ERROR", message: error instanceof Error ? error.message : "Official WebGPU benchmark failed." }));
  };
  const runPilot = () => {
    if (pilot.state === "RUNNING") return;
    const foodIntensity = snapshot?.species.id === "DROSOPHILA" ? snapshot.sensor.odor : 0;
    setPilot({ state: "RUNNING", message: `Verifying source evidence, then running the ${pilotProtocol.activationRateHz} Hz modelled sugar-input protocol over official v783 connectivity. This never controls walking or wings.` });
    void runSugarMn9Pilot("/manus-storage/manifest-web_191438ae.json", { foodIntensity, protocol: pilotProtocol })
      .then((result) => {
        // This is a constrained visual decoder, not MN9 physiology or muscle control.
        handleRef.current?.world.setFlywireProboscisReadout(decodeMn9StructuralScoreForProboscis(result.mn9StructuralScore));
        setPilot({ state: "MEASURED", result, message: `SOURCE DATA structural score read at MN9 after ${result.propagationSteps} propagation steps. Food encoding and proboscis conversion remain modelled mappings.` });
      })
      .catch((error: unknown) => setPilot({ state: "ERROR", message: error instanceof Error ? error.message : "The sugar-GRN → MN9 pilot could not run." }));
  };
  const runCpuCorridor = () => {
    if (cpuCorridor.state === "RUNNING") return;
    const foodIntensity = snapshot?.species.id === "DROSOPHILA" ? snapshot.sensor.odor : 0;
    const controller = new AbortController();
    cpuAbortRef.current = controller;
    setCpuCorridor({ state: "RUNNING", message: "Verifying the 1,115-node signed corridor, then running four bounded CPU structural-propagation steps. This does not activate FlyWire, GameWorld or FlyBody." });
    void runBoundedCpuSugarCorridor({ foodIntensity, protocol: pilotProtocol, signal: controller.signal })
      .then((result) => setCpuCorridor({ state: "MEASURED", result, message: "Checksum-verified CPU subgraph completed. Its signed structural score is an offline validation result, not LIF physiology or body control." }))
      .catch((error: unknown) => setCpuCorridor({ state: "ERROR", message: error instanceof Error && error.name === "AbortError" ? "CPU corridor validation was cancelled before any body or full-graph action." : error instanceof Error ? error.message : "Bounded CPU corridor validation failed." }))
      .finally(() => { if (cpuAbortRef.current === controller) cpuAbortRef.current = null; });
  };
  const cancelCpuCorridor = () => cpuAbortRef.current?.abort();
  const runSiteLevelLifPreflight = () => {
    if (lifReadiness.state === "CHECKING") return;
    setLifReadiness({ state: "CHECKING", stage: "SIGN", message: "Checking v783 site-level sign coverage, then WebGPU adapter and sign-aware buffer budget. No CPU fallback or body output can run." });
    void preflightFlywireSiteLevelLif(lifSettings)
      .then(setLifReadiness)
      .catch((error: unknown) => setLifReadiness({ state: "ERROR", stage: "NONE", message: error instanceof Error ? error.message : "Site-level LIF preflight failed." }));
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (event.altKey || event.ctrlKey || event.metaKey || target?.closest("button, input, select, textarea, [contenteditable='true']")) return;
      const command = commandForSimulationShortcut(event.code);
      if (!command) return;
      event.preventDefault();
      handleRef.current?.world.command(command);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return <main className="digital-fly-shell">
    <div className="scene-primer" aria-hidden="true"><span>OBSERVATION GARDEN / INITIALIZING</span></div>
    <canvas ref={canvasRef} className="lab-canvas" aria-label={`${snapshot?.species.displayName ?? "Specimen"} live simulation canvas`} />
    <svg className="axon-overlay" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true"><path d="M122 266C270 270 344 352 522 436S750 614 927 572" /><path d="M169 314C318 332 406 409 571 446S804 561 1095 422" /></svg>
    <SimulationHud snapshot={snapshot} onCommand={onCommand} packStatus={packStatus} cacheProgress={cacheProgress} flywireStage={flywireStage} onConfigurePack={configurePack} onCachePack={cachePack} benchmark={benchmark} onRunOfficialBenchmark={runOfficialBenchmark} lifSettings={lifSettings} lifReadiness={lifReadiness} onLifSettingChange={(key, value) => setLifSettings((current) => ({ ...current, [key]: value }))} onRunSiteLevelLifPreflight={runSiteLevelLifPreflight} pilot={pilot} cpuCorridor={cpuCorridor} pilotProtocol={pilotProtocol} onPilotActivationRateChange={(activationRateHz) => setPilotProtocol((current) => ({ ...current, activationRateHz }))} onPilotInputAblationChange={(inputAblation: SugarMn9InputAblation) => setPilotProtocol((current) => ({ ...current, inputAblation }))} onRunPilot={runPilot} onRunCpuCorridor={runCpuCorridor} onCancelCpuCorridor={cancelCpuCorridor} />
  </main>;
}
