/**
 * Luminous Connectome Lab: the DOM HUD is an observation bench, not the simulation owner.
 * Every live panel surfaces an explicit provenance label so synthetic or modelled values stay candid.
 */
import type { DflyPackStatus, FlywireStageStatus, SimulationCommand, SimulationSnapshot } from "@/game/shared/types";
import type { FlywireWebGpuBenchmark } from "@/game/connectome/flywireWebGpuBenchmark";
import type { SugarMn9PilotResult } from "@/game/connectome/sugarMn9PilotRuntime";
import { SUGAR_MN9_PILOT, type SugarMn9InputAblation, type SugarMn9PilotProtocol } from "@/game/connectome/sugarMn9Pilot";
import type { BoundedCpuCorridorResult } from "@/game/connectome/boundedCpuCorridor";
import { SUGAR_MN9_OFFLINE_VALIDATION } from "@/game/connectome/sugarMn9OfflineValidation";
import { SUGAR_MN9_MULTIHOP_CORRIDOR_VALIDATION } from "@/game/connectome/sugarMn9MultiHopCorridorValidation";
import { createHudActivitySlots } from "./hudActivitySlots";

const MARK_URL = "/manus-storage/digital-fly-mark_36065411.png";
const BRAIN_MAP_URL = "/manus-storage/digital-fly-brain-map_8c20bc49.png";

type Props = {
  snapshot: SimulationSnapshot | null;
  onCommand: (command: SimulationCommand) => void;
  packStatus: DflyPackStatus;
  cacheProgress: { completed: number; total: number } | null;
  flywireStage: FlywireStageStatus;
  onConfigurePack: () => void;
  onCachePack: () => void;
  benchmark: { state: "IDLE" | "RUNNING" | "MEASURED" | "ERROR"; message: string; result?: FlywireWebGpuBenchmark };
  onRunOfficialBenchmark: () => void;
  pilot: { state: "IDLE" | "RUNNING" | "MEASURED" | "ERROR"; message: string; result?: SugarMn9PilotResult };
  cpuCorridor: { state: "IDLE" | "RUNNING" | "MEASURED" | "ERROR"; message: string; result?: BoundedCpuCorridorResult };
  pilotProtocol: SugarMn9PilotProtocol;
  onPilotActivationRateChange: (activationRateHz: number) => void;
  onPilotInputAblationChange: (inputAblation: SugarMn9InputAblation) => void;
  onRunPilot: () => void;
  onRunCpuCorridor: () => void;
};

const numeric = (value: number, digits = 2) => value.toFixed(digits);
const percentage = (value: number) => `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;

export default function SimulationHud({ snapshot, onCommand, packStatus, cacheProgress, flywireStage, onConfigurePack, onCachePack, benchmark, onRunOfficialBenchmark, pilot, cpuCorridor, pilotProtocol, onPilotActivationRateChange, onPilotInputAblationChange, onRunPilot, onRunCpuCorridor }: Props) {
  const sensor = snapshot?.sensor;
  const motor = snapshot?.motor;
  const activity = snapshot?.neuronActivity ?? new Float32Array(0);
  const timeline = snapshot?.timeline ?? new Float32Array(64);
  const activitySlots = createHudActivitySlots(activity.length);
  const execution = snapshot?.connectomeExecution;
  const usesSourceTopology = execution?.topology === "SOURCE DATA";
  const showingFly = snapshot?.species.id === "DROSOPHILA";
  const flywireStaged = showingFly && execution?.label.includes("FLYWIRE V783 STAGED");
  const controlPath = flywireStaged
    ? "FLY: display gait only. Environment sliders do not drive a FlyWire network or a scientific motor decoder while 0 N / 0 E remains staged."
    : usesSourceTopology
      ? "C. ELEGANS: environment fields → modelled sensor routing → 279 N / 6,261 E source topology → modelled motor grouping → body wave."
      : "Source topology is not active; no synthetic neural fallback is used.";

  return (
    <div className="lab-hud" aria-live="polite">
      <header className="lab-header">
        <div className="brand-lockup">
          <img className="brand-mark" src={MARK_URL} alt="My Greatest Sin aperture mark" />
          <div>
            <p className="micro-label">DUAL-SPECIES / CONNECTOME OBSERVATION BENCH</p>
            <h1>MY GREATEST SIN</h1>
          </div>
        </div>
        <div className="header-status">
          <span className="status-dot" />
          <span>{snapshot?.paused ? "PAUSED" : "LIVE LOOP"}</span>
          <span className="header-rule" />
          <span>{snapshot ? `${numeric(snapshot.fps, 0)} FPS` : "CALIBRATING"}</span>
        </div>
      </header>

      <aside className="observation-rail left-rail">
        <section className="lab-pane brain-pane">
          <div className="pane-heading">
            <div>
              <p className="micro-label">01 / LIVE ACTIVITY</p>
              <h2>Brain sample</h2>
            </div>
            <span className="provenance source">{snapshot?.neuronCount ?? 0} N</span>
          </div>
          <div className="brain-atlas">
            <img src={BRAIN_MAP_URL} alt="Abstract generated brain activity atlas" />
            <div className="sampled-neurons" aria-label="Sampled neural activity markers">
              {activitySlots.map(({ index, key, neuron }) => {
                const intensity = activity[neuron] ?? 0;
                return <i key={key} className={intensity > 0.035 ? "active" : ""} style={{ "--dot": index } as React.CSSProperties} />;
              })}
            </div>
          </div>
          <div className="readout-line"><span>ACTIVE CELLS</span><strong>{snapshot?.activeNeurons ?? 0}</strong></div>
          <div className="readout-line"><span>SPIKES / STEP</span><strong>{snapshot?.spikeCount ?? 0}</strong></div>
          <div className="readout-line"><span>MEAN RATE</span><strong>{numeric(snapshot?.averageRate ?? 0, 3)}</strong></div>
          <p className="pane-note">{execution?.detail ?? "Rendering is sampled while the simulation prepares."}</p>
        </section>

        <section className="lab-pane provenance-pane">
          <p className="micro-label">DATA STATUS</p>
          <div className="provenance-row"><span className={`provenance ${usesSourceTopology ? "source" : "fixture"}`}>{execution?.label ?? "SYNTHETIC TEST FIXTURE"}</span><span>{snapshot?.neuronCount ?? 0} N / {snapshot?.synapseCount ?? 0} E</span></div>
          <p>{snapshot?.species.bodyLabel ?? "SPECIMEN BODY"}: modelled presentation. {usesSourceTopology ? "Topology executes from integrity-checked source columns; stimulus routing and motor embodiment remain modelled mappings." : flywireStaged ? "No substitute neural fixture executes for the fly. The official pack is staged outside this public app pending WebGPU benchmark and delivery approval." : "No synthetic fallback is active while the source pack is verified."}</p>
          <p className="micro-label">CAUSAL CONTROL STATUS</p>
          <p className="pane-note">{controlPath}</p>
          <div className="source-readout"><span>BODY REFERENCE</span><strong>{snapshot?.species.sourceLicense ?? "—"}</strong></div>
          <div className="memory-readout"><span>EDGE COLUMNS</span><strong>{numeric(snapshot?.memoryEstimateMiB ?? 0)} MiB</strong></div>
          {showingFly && <><div className="provenance-row"><span className="provenance source">FLYWIRE V783 STAGED</span><span>{flywireStage.neuronCount.toLocaleString()} N / {flywireStage.synapseCount.toLocaleString()} E</span></div><p className="pack-message">{flywireStage.message}</p><div className="pack-state blocked"><span>LICENSE</span><strong>{flywireStage.license} · {flywireStage.packMiB} MiB</strong></div></>}
          {showingFly && <div className={`pack-state ${benchmark.state.toLowerCase()}`}><span>WEBGPU BENCHMARK</span><strong>{benchmark.state}</strong></div>}
          {showingFly && <p className="pack-message">{benchmark.message}</p>}
          {showingFly && benchmark.result && <div className="source-readout"><span>MEASURED STEP</span><strong>{benchmark.result.meanStepMs.toFixed(2)} MS · {benchmark.result.residentGpuMiB.toFixed(1)} MiB GPU</strong></div>}
          {showingFly && <button className="pack-action" disabled={benchmark.state === "RUNNING"} onClick={onRunOfficialBenchmark}>{benchmark.state === "RUNNING" ? "MEASURING WEBGPU" : "RUN OFFICIAL WEBGPU BENCHMARK"}</button>}
          {showingFly && <div className="pilot-readout"><p className="micro-label">SENSORIMOTOR PILOT / SELECTED</p><strong>{SUGAR_MN9_PILOT.label}</strong><p><span className="provenance source">SOURCE DATA</span> {SUGAR_MN9_PILOT.inputRootIds.length} published sugar-GRN root IDs → MN9 root ID.</p><p><span className="provenance fixture">MODELLED MAPPING</span> Food encoding and a constrained mouthpart decoder are separate. This pilot can never drive walking, wings, or root movement.</p><label className="stimulus-row"><span>SUGAR INPUT / MODELLED</span><output>{pilotProtocol.activationRateHz} HZ</output><input className="gold" type="range" min="0" max="200" step="25" value={pilotProtocol.activationRateHz} onChange={(event) => onPilotActivationRateChange(Number(event.target.value))} /></label><div className="control-actions pilot-actions"><button className={pilotProtocol.inputAblation === "OPEN" ? "selected" : ""} onClick={() => onPilotInputAblationChange("OPEN")}>INPUT OPEN</button><button className={pilotProtocol.inputAblation === "CLOSED" ? "selected" : ""} onClick={() => onPilotInputAblationChange("CLOSED")}>INPUT ABLATED</button></div><p className="pane-note">INPUT ABLATED is a modelled negative control: it closes only external sugar injection, not biological synapses.</p><div className={`pack-state ${pilot.state.toLowerCase()}`}><span>PILOT EXECUTION</span><strong>{pilot.state}</strong></div><p className="pack-message">{pilot.message}</p>{pilot.result && <><div className="source-readout"><span>MN9 STRUCTURAL SCORE</span><strong>{pilot.result.mn9StructuralScore.toFixed(4)} · {pilot.result.evidenceTwoHopIntermediates} TWO-HOP PATHS</strong></div><div className="source-readout"><span>ADAPTER BUDGET</span><strong>{pilot.result.estimatedResidentGpuMiB.toFixed(1)} MIB · {pilot.result.timestampQueryAvailable ? "TIMESTAMPS" : "NO TIMESTAMPS"}</strong></div></>}<div className={`pack-state ${cpuCorridor.state.toLowerCase()}`}><span>CPU OFFLINE CORRIDOR</span><strong>{cpuCorridor.state}</strong></div><p className="pack-message">{cpuCorridor.message}</p>{cpuCorridor.result && <div className="source-readout"><span>CPU MN9 STRUCTURAL SCORE</span><strong>{cpuCorridor.result.mn9StructuralScore.toFixed(4)} · {cpuCorridor.result.nodeCount.toLocaleString()} N / {cpuCorridor.result.edgeCount.toLocaleString()} E · NO BODY OUTPUT</strong></div>}<button className="pack-action" disabled={cpuCorridor.state === "RUNNING"} onClick={onRunCpuCorridor}>{cpuCorridor.state === "RUNNING" ? "RUNNING CPU CORRIDOR" : "RUN BOUNDED CPU CORRIDOR"}</button><div className="pack-state blocked"><span>{SUGAR_MN9_OFFLINE_VALIDATION.status}</span><strong>{SUGAR_MN9_OFFLINE_VALIDATION.interpretation}</strong></div><p className="pack-message">{SUGAR_MN9_OFFLINE_VALIDATION.nodeCount} N / {SUGAR_MN9_OFFLINE_VALIDATION.edgeCount} E · {SUGAR_MN9_OFFLINE_VALIDATION.trialsPerCondition} seeded trials per rate: MN9 = 0 Hz across {SUGAR_MN9_OFFLINE_VALIDATION.ratesHz.join(", ")} Hz. {SUGAR_MN9_OFFLINE_VALIDATION.boundary}</p><div className="pack-state measured"><span>{SUGAR_MN9_MULTIHOP_CORRIDOR_VALIDATION.status}</span><strong>{SUGAR_MN9_MULTIHOP_CORRIDOR_VALIDATION.interpretation}</strong></div><p className="pack-message">{SUGAR_MN9_MULTIHOP_CORRIDOR_VALIDATION.nodeCount.toLocaleString()} N / {SUGAR_MN9_MULTIHOP_CORRIDOR_VALIDATION.edgeCount.toLocaleString()} E · 25 Hz → {SUGAR_MN9_MULTIHOP_CORRIDOR_VALIDATION.baselineMn9RatesHz[1]} Hz MN9; input-ablation → 0 Hz. {SUGAR_MN9_MULTIHOP_CORRIDOR_VALIDATION.boundary}</p><button className="pack-action" disabled={pilot.state === "RUNNING"} onClick={onRunPilot}>{pilot.state === "RUNNING" ? "RUNNING SUGAR → MN9" : "RUN SUGAR → MN9 PILOT"}</button></div>}
          <div className="pack-control-row"><button className={usesSourceTopology ? "pack-action" : packStatus.state === "ERROR" || packStatus.state === "BLOCKED" ? "pack-action pack-warning" : "pack-action"} title={usesSourceTopology ? execution?.detail : packStatus.message} onClick={usesSourceTopology ? undefined : onConfigurePack}>{usesSourceTopology ? "SOURCE PACK ACTIVE" : packStatus.state === "CACHED" ? "PACK CACHED" : packStatus.state === "VALIDATED" ? "PACK READY" : packStatus.state === "ERROR" ? "PACK ERROR" : "VERIFY DFLY PACK"}</button>{!usesSourceTopology && (packStatus.state === "VALIDATED" || packStatus.state === "CACHED") && <button className="pack-action cache-action" onClick={onCachePack}>{cacheProgress ? `CACHE ${cacheProgress.completed}/${cacheProgress.total}` : "CACHE"}</button>}</div>
          {packStatus.state !== "UNCONFIGURED" && <div className={`pack-state ${packStatus.state.toLowerCase()}`}><span>DFLY</span><strong>{packStatus.state.replace("_", " ")}</strong></div>}
          {(packStatus.state === "VALIDATED" || packStatus.state === "CACHED" || packStatus.state === "BLOCKED" || packStatus.state === "ERROR") && <p className="pack-message">{packStatus.message}</p>}
        </section>
      </aside>

      <section className="world-caption">
        <p className="micro-label">{flywireStaged ? "FLYWIRE EXECUTION PARKED / WEBGPU BENCHMARK REQUIRED" : "CLOSED LOOP / ENVIRONMENT → SENSORS → NETWORK → MOTOR → BODY"}</p>
        <div className="behavior-title"><span className="state-hash">//</span><strong>{flywireStaged ? "DISPLAY GAIT / NO NEURAL CONTROL" : snapshot?.behavior ?? "INITIALIZING"}</strong></div>
        <p>{flywireStaged ? "The Drosophila model can move only through an explicitly modelled display gait. It has no active FlyWire topology, no substitute neural fixture, and no scientifically validated environment-to-body control until the official pack passes a sparse WebGPU benchmark." : `${snapshot?.species.commonName ?? "SPECIMEN"} motion is modelled from the live motor decoder; it is not a pre-recorded walk cycle.`}</p>
      </section>

      <aside className="observation-rail right-rail">
        <section className="lab-pane control-pane">
          <div className="pane-heading">
            <div><p className="micro-label">02 / EXPERIMENT</p><h2>Stimulus rig</h2></div>
            <button className={snapshot?.paused ? "primary-button armed" : "primary-button"} onClick={() => onCommand({ type: "toggle" })}>{snapshot?.paused ? "RESUME" : "PAUSE"}</button>
          </div>
          <div className="control-actions">
            <button onClick={() => onCommand({ type: "step" })}>STEP 5 MS</button>
            <button onClick={() => onCommand({ type: "reset" })}>RESET</button>
            <button className="demo-button" onClick={() => onCommand({ type: "demo" })}>AUTO DEMO</button>
          </div>
          <div className="species-selector" role="group" aria-label="Select a modelled specimen body">
            <button className={snapshot?.species.id === "DROSOPHILA" ? "selected" : ""} onClick={() => onCommand({ type: "species", species: "DROSOPHILA" })}>FLY</button>
            <button className={snapshot?.species.id === "C_ELEGANS" ? "selected" : ""} onClick={() => onCommand({ type: "species", species: "C_ELEGANS" })}>C. ELEGANS</button>
          </div>
          <Stimulus label="FOOD / ODOR" value={sensor?.odor ?? 0} color="gold" onChange={(amount) => onCommand({ type: "stimulus", stimulus: "food", amount })} />
          <Stimulus label="LIGHT FIELD" value={sensor?.light ?? 0} color="gold" onChange={(amount) => onCommand({ type: "stimulus", stimulus: "light", amount })} />
          <Stimulus label="WIND VECTOR" value={sensor?.wind ?? 0} color="cyan" onChange={(amount) => onCommand({ type: "stimulus", stimulus: "wind", amount })} />
          <Stimulus label="TOUCH PULSE" value={sensor?.touch ?? 0} color="magenta" onChange={(amount) => onCommand({ type: "stimulus", stimulus: "touch", amount })} />
          <Stimulus label="TEMPERATURE" value={(sensor?.temperature ?? 0 + 1) / 2} color="cyan" onChange={(amount) => onCommand({ type: "stimulus", stimulus: "temperature", amount })} />
          <div className="environment-divider"><span>GARDEN PRESENTATION / MODELLED</span></div>
          <Stimulus label="DAYLIGHT" value={snapshot?.environment.daylight ?? 0.18} color="gold" onChange={(amount) => onCommand({ type: "environment", setting: "daylight", amount })} />
          <Stimulus label="WATERFALL FLOW" value={snapshot?.environment.waterfall ?? 0.62} color="cyan" onChange={(amount) => onCommand({ type: "environment", setting: "waterfall", amount })} />
        </section>

        <section className="lab-pane decode-pane">
          <p className="micro-label">03 / MODELLED READOUT</p>
          <h2>Motor decode</h2>
          <DecodeBar label="FORWARD" value={motor?.forward ?? 0} />
          <DecodeBar label="TURN" value={Math.abs(motor?.turn ?? 0)} />
          <DecodeBar label={snapshot?.species.id === "C_ELEGANS" ? "BODY WAVE" : "WING LIFT"} value={motor?.wingLift ?? 0} />
          <p className="pane-note">{controlPath}</p>
        </section>
      </aside>

      <section className="timeline-strip">
        <div className="timeline-label"><p className="micro-label">NEURAL EVENT BUFFER</p><strong>{numeric(snapshot?.timeSeconds ?? 0, 2)} S</strong></div>
        <svg viewBox="0 0 640 76" preserveAspectRatio="none" aria-label="Recent neural spike timeline">
          <path className="timeline-grid" d="M0 18H640M0 38H640M0 58H640" />
          <polyline className="timeline-path" points={Array.from({ length: timeline.length }, (_, index) => `${index * (640 / (timeline.length - 1))},${66 - timeline[index] * 52}`).join(" ")} />
          <line className="timeline-now" x1="638" y1="5" x2="638" y2="71" />
        </svg>
        <div className="timeline-key"><span className="key-dot spike" />SPIKE DENSITY <span className="key-dot stimulus" />STIMULUS</div>
      </section>
    </div>
  );
}

function Stimulus({ label, value, color, onChange }: { label: string; value: number; color: "gold" | "cyan" | "magenta"; onChange: (amount: number) => void }) {
  return <label className="stimulus-row"><span>{label}</span><output>{percentage(value)}</output><input className={color} type="range" min="0" max="1" step="0.05" value={Math.max(0, Math.min(1, value))} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function DecodeBar({ label, value }: { label: string; value: number }) {
  return <div className="decode-row"><span>{label}</span><div><i style={{ width: percentage(value) }} /></div><strong>{percentage(value)}</strong></div>;
}
