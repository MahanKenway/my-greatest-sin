/**
 * Luminous Connectome Lab: a species-aware observation console derived only from SimulationSnapshot.
 * FlyWire remains staged unless the snapshot says otherwise; garden presentation controls never assert neural causality.
 */
import type { DflyPackStatus, FlywireStageStatus, SimulationCommand, SimulationSnapshot } from "@/game/shared/types";
import type { FlywireWebGpuBenchmark } from "@/game/connectome/flywireWebGpuBenchmark";
import type { SugarMn9PilotResult } from "@/game/connectome/sugarMn9PilotRuntime";
import { SUGAR_MN9_PILOT, type SugarMn9InputAblation, type SugarMn9PilotProtocol } from "@/game/connectome/sugarMn9Pilot";
import type { BoundedCpuCorridorResult } from "@/game/connectome/boundedCpuCorridor";
import { MD_C_CROSSWALK_STATUS } from "@/game/connectome/mdCCrosswalkStatus";
import { SUGAR_MN9_OFFLINE_VALIDATION } from "@/game/connectome/sugarMn9OfflineValidation";
import { SUGAR_MN9_MULTIHOP_CORRIDOR_VALIDATION } from "@/game/connectome/sugarMn9MultiHopCorridorValidation";
import { createHudActivitySlots } from "./hudActivitySlots";

const MARK_URL = "/manus-storage/connectome-aperture-mark-v2_4089ca2b.png";
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
  onCancelCpuCorridor: () => void;
};

const numeric = (value: number, digits = 2) => value.toFixed(digits);
const percentage = (value: number) => `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;

function skyLabel(daylight: number): string {
  if (daylight < 0.18) return "NIGHT GARDEN";
  if (daylight < 0.42) return "BLUE HOUR";
  if (daylight < 0.7) return "GOLDEN MORNING";
  return "OPEN DAYLIGHT";
}

export default function SimulationHud({ snapshot, onCommand, packStatus, cacheProgress, flywireStage, onConfigurePack, onCachePack, benchmark, onRunOfficialBenchmark, pilot, cpuCorridor, pilotProtocol, onPilotActivationRateChange, onPilotInputAblationChange, onRunPilot, onRunCpuCorridor, onCancelCpuCorridor }: Props) {
  const sensor = snapshot?.sensor;
  const motor = snapshot?.motor;
  const activity = snapshot?.neuronActivity ?? new Float32Array(0);
  const timeline = snapshot?.timeline ?? new Float32Array(64);
  const activitySlots = createHudActivitySlots(activity.length);
  const execution = snapshot?.connectomeExecution;
  const usesSourceTopology = execution?.topology === "SOURCE DATA";
  const showingFly = snapshot?.species.id === "DROSOPHILA";
  const flywireStaged = showingFly && execution?.label.includes("FLYWIRE V783 STAGED");
  const runtimeMode = flywireStaged ? "STAGED OBSERVATION" : usesSourceTopology ? "SOURCE TOPOLOGY ACTIVE" : "PACK PREPARING";
  const controlPath = flywireStaged
    ? "Display gait only. Garden and field controls do not drive FlyWire, a scientific motor decoder, or the fly body."
    : usesSourceTopology
      ? "Modelled field encoding → 279 N / 6,261 E source topology → modelled motor grouping → body wave."
      : "Source topology is not active; no synthetic neural fallback is used.";
  const sky = skyLabel(snapshot?.environment.daylight ?? 0.34);

  return (
    <div className="lab-hud" aria-live="polite">
      <header className="lab-header">
        <div className="brand-lockup">
          <img className="brand-mark" src={MARK_URL} alt="My Greatest Sin aperture mark" />
          <div>
            <p className="micro-label">LIVE OBSERVATION BENCH</p>
            <h1>MY GREATEST SIN</h1>
          </div>
        </div>
      </header>

      <aside className="observation-rail left-rail">
        <section className="lab-pane specimen-pane">
          <div className="pane-heading">
            <div><p className="micro-label">01 / ACTIVE SPECIMEN</p><h2>{snapshot?.species.commonName ?? "Loading specimen"}</h2></div>
            <span className={`provenance ${usesSourceTopology ? "source" : "fixture"}`}>{runtimeMode}</span>
          </div>
          <div className={usesSourceTopology ? "signal-portrait source-active" : "signal-portrait staged"}>
            {usesSourceTopology ? <><img src={BRAIN_MAP_URL} alt="Sampled activity atlas for active source topology" /><div className="sampled-neurons" aria-label="Sampled neural activity markers">{activitySlots.map(({ index, key, neuron }) => <i key={key} className={(activity[neuron] ?? 0) > 0.035 ? "active" : ""} style={{ "--dot": index } as React.CSSProperties} />)}</div></> : <div className="staged-glyph"><span>0</span><small>NETWORK EXECUTIONS</small><p>Awaiting a verified device and official delivery gate.</p></div>}
          </div>
          <div className="runtime-grid">
            <Readout label="NODES" value={`${snapshot?.neuronCount ?? 0} N`} />
            <Readout label="EDGES" value={`${snapshot?.synapseCount ?? 0} E`} />
            <Readout label="SPIKES" value={`${snapshot?.spikeCount ?? 0} / STEP`} />
            <Readout label="RATE" value={numeric(snapshot?.averageRate ?? 0, 3)} />
          </div>
          <p className="pane-note causal-note">{controlPath}</p>
        </section>

        <EvidenceLedger showingFly={Boolean(showingFly)} usesSourceTopology={Boolean(usesSourceTopology)} executionLabel={execution?.label ?? "NO RUNTIME"} flywireStage={flywireStage} benchmark={benchmark} onRunOfficialBenchmark={onRunOfficialBenchmark} pilot={pilot} cpuCorridor={cpuCorridor} pilotProtocol={pilotProtocol} onPilotActivationRateChange={onPilotActivationRateChange} onPilotInputAblationChange={onPilotInputAblationChange} onRunPilot={onRunPilot} onRunCpuCorridor={onRunCpuCorridor} onCancelCpuCorridor={onCancelCpuCorridor} packStatus={packStatus} cacheProgress={cacheProgress} onConfigurePack={onConfigurePack} onCachePack={onCachePack} />
      </aside>

      <section className="world-caption">
        <p className="micro-label">{flywireStaged ? "FLYWIRE V783 / NETWORK PARKED" : "LIVE SOURCE LOOP / MODELLED EMBODIMENT"}</p>
        <div className="behavior-title"><span className="state-hash">//</span><strong>{flywireStaged ? "DISPLAY GAIT" : snapshot?.behavior ?? "INITIALIZING"}</strong></div>
        <p>{flywireStaged ? "A visual specimen in a presentation garden. No FlyWire network, body-control claim, or hidden substitute is active." : "The source topology is active; field encoding and body decode remain explicitly modelled."}</p>
      </section>

      <aside className="observation-rail right-rail">
        <section className="lab-pane control-pane">
          <div className="pane-heading"><div><p className="micro-label">02 / OBSERVATION CONTROLS</p><h2>Field console</h2></div><button className={snapshot?.paused ? "primary-button armed" : "primary-button"} onClick={() => onCommand({ type: "toggle" })}>{snapshot?.paused ? "RESUME" : "PAUSE"}</button></div>
          <div className="species-selector" role="group" aria-label="Select an observation specimen"><button className={snapshot?.species.id === "DROSOPHILA" ? "selected" : ""} onClick={() => onCommand({ type: "species", species: "DROSOPHILA" })}>FLY / STAGED</button><button className={snapshot?.species.id === "C_ELEGANS" ? "selected" : ""} onClick={() => onCommand({ type: "species", species: "C_ELEGANS" })}>C. ELEGANS / LIVE</button></div>
          <div className="control-actions"><button onClick={() => onCommand({ type: "reset" })}>RESET CAMERA</button><button className="demo-button" onClick={() => onCommand({ type: "demo" })}>{snapshot?.paused ? "ARM DEMO" : "AUTO DEMO"}</button></div>
          <div className="section-rule"><span>{flywireStaged ? "WORLD PROBES / VISUAL ONLY" : "FIELD PROBES / MODELLED INPUT"}</span></div>
          <Stimulus label="FOOD / ODOR" value={sensor?.odor ?? 0} color="gold" onChange={(amount) => onCommand({ type: "stimulus", stimulus: "food", amount })} />
          <Stimulus label="LIGHT FIELD" value={sensor?.light ?? 0} color="gold" onChange={(amount) => onCommand({ type: "stimulus", stimulus: "light", amount })} />
          <Stimulus label="WIND VECTOR" value={sensor?.wind ?? 0} color="cyan" onChange={(amount) => onCommand({ type: "stimulus", stimulus: "wind", amount })} />
          <div className="section-rule presentation"><span>SKY CYCLE / PRESENTATION ONLY</span><strong>{sky}</strong></div>
          <Stimulus label="DAYLIGHT" value={snapshot?.environment.daylight ?? 0.18} color="gold" onChange={(amount) => onCommand({ type: "environment", setting: "daylight", amount })} />
          <Stimulus label="WATERFALL FLOW" value={snapshot?.environment.waterfall ?? 0.62} color="cyan" onChange={(amount) => onCommand({ type: "environment", setting: "waterfall", amount })} />
        </section>

        <section className="lab-pane decode-pane">
          <div className="pane-heading"><div><p className="micro-label">03 / {flywireStaged ? "DISPLAY" : "MODELLED"} BODY READOUT</p><h2>{flywireStaged ? "Presentation gait" : "Motor decode"}</h2></div><span className="provenance fixture">{flywireStaged ? "NO NETWORK" : "MODELLED"}</span></div>
          <DecodeBar label="FORWARD" value={motor?.forward ?? 0} />
          <DecodeBar label="TURN" value={Math.abs(motor?.turn ?? 0)} />
          <DecodeBar label={snapshot?.species.id === "C_ELEGANS" ? "BODY WAVE" : "WING LIFT"} value={motor?.wingLift ?? 0} />
          <p className="pane-note">{controlPath}</p>
        </section>
      </aside>

      <section className="timeline-strip">
        <div className="timeline-label"><p className="micro-label">{flywireStaged ? "OBSERVATION STRIP" : "NEURAL EVENT BUFFER"}</p><strong>{flywireStaged ? "PARKED" : `${numeric(snapshot?.timeSeconds ?? 0, 2)} S`}</strong></div>
        {flywireStaged ? <div className="timeline-empty"><i /><span>NO FLYWIRE EVENTS ARE EXECUTING IN THIS VIEW.</span><em>DISPLAY MOTION ONLY</em></div> : <svg viewBox="0 0 640 76" preserveAspectRatio="none" aria-label="Recent neural spike timeline"><path className="timeline-grid" d="M0 18H640M0 38H640M0 58H640" /><polyline className="timeline-path" points={Array.from({ length: timeline.length }, (_, index) => `${index * (640 / (timeline.length - 1))},${66 - timeline[index] * 52}`).join(" ")} /><line className="timeline-now" x1="638" y1="5" x2="638" y2="71" /></svg>}
        <div className="timeline-key"><span className="key-dot spike" />{flywireStaged ? "NETWORK PARKED" : "SPIKE DENSITY"}<span className="key-dot stimulus" />{flywireStaged ? "MODELLED GARDEN" : "STIMULUS"}</div>
      </section>
    </div>
  );
}

function EvidenceLedger({ showingFly, usesSourceTopology, executionLabel, flywireStage, benchmark, onRunOfficialBenchmark, pilot, cpuCorridor, pilotProtocol, onPilotActivationRateChange, onPilotInputAblationChange, onRunPilot, onRunCpuCorridor, onCancelCpuCorridor, packStatus, cacheProgress, onConfigurePack, onCachePack }: { showingFly: boolean; usesSourceTopology: boolean; executionLabel: string; flywireStage: FlywireStageStatus; benchmark: Props["benchmark"]; onRunOfficialBenchmark: () => void; pilot: Props["pilot"]; cpuCorridor: Props["cpuCorridor"]; pilotProtocol: SugarMn9PilotProtocol; onPilotActivationRateChange: (value: number) => void; onPilotInputAblationChange: (value: SugarMn9InputAblation) => void; onRunPilot: () => void; onRunCpuCorridor: () => void; onCancelCpuCorridor: () => void; packStatus: DflyPackStatus; cacheProgress: Props["cacheProgress"]; onConfigurePack: () => void; onCachePack: () => void }) {
  return <section className="lab-pane ledger-pane"><details><summary><span>04 / EVIDENCE LEDGER</span><strong>{usesSourceTopology ? "SOURCE" : showingFly ? "STAGED" : "VERIFY"}</strong></summary><div className="ledger-body"><div className="provenance-row"><span className={`provenance ${usesSourceTopology ? "source" : "fixture"}`}>{executionLabel}</span></div>{showingFly && <><div className="provenance-row"><span className="provenance source">FLYWIRE V783 STAGED</span><span>{flywireStage.neuronCount.toLocaleString()} N / {flywireStage.synapseCount.toLocaleString()} E</span></div><p className="pack-message">{flywireStage.message}</p><div className={`pack-state ${benchmark.state.toLowerCase()}`}><span>WEBGPU BENCHMARK</span><strong>{benchmark.state}</strong></div><p className="pack-message">{benchmark.message}</p>{benchmark.result && <div className="source-readout"><span>MEASURED STEP</span><strong>{benchmark.result.meanStepMs.toFixed(2)} MS · {benchmark.result.residentGpuMiB.toFixed(1)} MiB GPU</strong></div>}<button className="pack-action" disabled={benchmark.state === "RUNNING"} onClick={onRunOfficialBenchmark}>{benchmark.state === "RUNNING" ? "MEASURING WEBGPU" : "RUN OFFICIAL WEBGPU BENCHMARK"}</button><MdCCrosswalkDisclosure /><div className="pilot-readout"><p className="micro-label">SUGAR → MN9 / BOUNDED PILOT</p><strong>{SUGAR_MN9_PILOT.label}</strong><p><span className="provenance source">SOURCE DATA</span> {SUGAR_MN9_PILOT.inputRootIds.length} published sugar-GRN root IDs → MN9.</p><label className="stimulus-row"><span>SUGAR INPUT / MODELLED</span><output>{pilotProtocol.activationRateHz} HZ</output><input className="gold" type="range" min="0" max="200" step="25" value={pilotProtocol.activationRateHz} onChange={(event) => onPilotActivationRateChange(Number(event.target.value))} /></label><div className="control-actions pilot-actions"><button className={pilotProtocol.inputAblation === "OPEN" ? "selected" : ""} onClick={() => onPilotInputAblationChange("OPEN")}>INPUT OPEN</button><button className={pilotProtocol.inputAblation === "CLOSED" ? "selected" : ""} onClick={() => onPilotInputAblationChange("CLOSED")}>INPUT ABLATED</button></div><div className={`pack-state ${pilot.state.toLowerCase()}`}><span>PILOT</span><strong>{pilot.state}</strong></div><p className="pack-message">{pilot.message}</p>{pilot.result && <div className="source-readout"><span>MN9 STRUCTURAL SCORE</span><strong>{pilot.result.mn9StructuralScore.toFixed(4)}</strong></div>}<div className={`pack-state ${cpuCorridor.state.toLowerCase()}`}><span>CPU CORRIDOR</span><strong>{cpuCorridor.state}</strong></div><p className="pack-message">{cpuCorridor.message}</p><div className="control-actions pilot-actions"><button className="pack-action" disabled={cpuCorridor.state === "RUNNING"} onClick={onRunCpuCorridor}>{cpuCorridor.state === "RUNNING" ? "RUNNING CPU CORRIDOR" : "RUN BOUNDED CPU CORRIDOR"}</button>{cpuCorridor.state === "RUNNING" && <button className="pack-action pack-warning" onClick={onCancelCpuCorridor}>CANCEL</button>}</div><p className="pack-message">{SUGAR_MN9_OFFLINE_VALIDATION.status}: {SUGAR_MN9_OFFLINE_VALIDATION.interpretation}. {SUGAR_MN9_MULTIHOP_CORRIDOR_VALIDATION.nodeCount.toLocaleString()} N / {SUGAR_MN9_MULTIHOP_CORRIDOR_VALIDATION.edgeCount.toLocaleString()} E corridor remains offline, bounded and body-disconnected.</p><button className="pack-action" disabled={pilot.state === "RUNNING"} onClick={onRunPilot}>{pilot.state === "RUNNING" ? "RUNNING SUGAR → MN9" : "RUN SUGAR → MN9 PILOT"}</button></div></>}{!usesSourceTopology && <div className="pack-control-row"><button className={packStatus.state === "ERROR" || packStatus.state === "BLOCKED" ? "pack-action pack-warning" : "pack-action"} title={packStatus.message} onClick={onConfigurePack}>{packStatus.state === "CACHED" ? "PACK CACHED" : packStatus.state === "VALIDATED" ? "PACK READY" : packStatus.state === "ERROR" ? "PACK ERROR" : "VERIFY DFLY PACK"}</button>{(packStatus.state === "VALIDATED" || packStatus.state === "CACHED") && <button className="pack-action cache-action" onClick={onCachePack}>{cacheProgress ? `CACHE ${cacheProgress.completed}/${cacheProgress.total}` : "CACHE"}</button>}</div>}</div></details></section>;
}

function MdCCrosswalkDisclosure() {
  return <div className="crosswalk-disclosure"><p className="micro-label">MD-C → MN11/MN12 / EVIDENCE GATE</p><div className="pack-state blocked"><span>ROOT CROSSWALK</span><strong>{MD_C_CROSSWALK_STATUS.status}</strong></div><p className="pack-message">{MD_C_CROSSWALK_STATUS.evidence} No pharyngeal surrogate or MN9 substitution can run.</p></div>;
}

function Readout({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function Stimulus({ label, value, color, onChange }: { label: string; value: number; color: "gold" | "cyan" | "magenta"; onChange: (amount: number) => void }) {
  return <label className="stimulus-row"><span>{label}</span><output>{percentage(value)}</output><input className={color} type="range" min="0" max="1" step="0.05" value={Math.max(0, Math.min(1, value))} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function DecodeBar({ label, value }: { label: string; value: number }) {
  return <div className="decode-row"><span>{label}</span><div><i style={{ width: percentage(value) }} /></div><strong>{percentage(value)}</strong></div>;
}
