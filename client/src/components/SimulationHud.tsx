/**
 * Luminous Connectome Lab: the DOM HUD is an observation bench, not the simulation owner.
 * Every live panel surfaces an explicit provenance label so synthetic or modelled values stay candid.
 */
import type { SimulationCommand, SimulationSnapshot } from "@/game/shared/types";

const MARK_URL = "/manus-storage/digital-fly-mark_36065411.png";
const BRAIN_MAP_URL = "/manus-storage/digital-fly-brain-map_8c20bc49.png";

type Props = {
  snapshot: SimulationSnapshot | null;
  onCommand: (command: SimulationCommand) => void;
};

const numeric = (value: number, digits = 2) => value.toFixed(digits);
const percentage = (value: number) => `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;

export default function SimulationHud({ snapshot, onCommand }: Props) {
  const sensor = snapshot?.sensor;
  const motor = snapshot?.motor;
  const activity = snapshot?.neuronActivity ?? new Float32Array(0);
  const timeline = snapshot?.timeline ?? new Float32Array(64);
  const sampleIndices = [2, 7, 11, 19, 24, 31, 38, 44, 53, 61, 67, 72, 79, 86, 92, 95];

  return (
    <div className="lab-hud" aria-live="polite">
      <header className="lab-header">
        <div className="brand-lockup">
          <img className="brand-mark" src={MARK_URL} alt="Digital Fly aperture mark" />
          <div>
            <p className="micro-label">CONNECTOME OBSERVATION BENCH</p>
            <h1>DIGITAL FLY</h1>
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
              {sampleIndices.map((neuron, index) => {
                const intensity = activity[neuron] ?? 0;
                return <i key={neuron} className={intensity > 0.035 ? "active" : ""} style={{ "--dot": index } as React.CSSProperties} />;
              })}
            </div>
          </div>
          <div className="readout-line"><span>ACTIVE CELLS</span><strong>{snapshot?.activeNeurons ?? 0}</strong></div>
          <div className="readout-line"><span>SPIKES / STEP</span><strong>{snapshot?.spikeCount ?? 0}</strong></div>
          <div className="readout-line"><span>MEAN RATE</span><strong>{numeric(snapshot?.averageRate ?? 0, 3)}</strong></div>
          <p className="pane-note">Rendering is sampled. The fixture remains a software test network, not FlyWire biology.</p>
        </section>

        <section className="lab-pane provenance-pane">
          <p className="micro-label">DATA STATUS</p>
          <div className="provenance-row"><span className="provenance fixture">SYNTHETIC TEST FIXTURE</span><span>96 N / {snapshot?.synapseCount ?? 0} E</span></div>
          <p>Full release execution is locked until a validated, cited `DFLY` manifest is loaded.</p>
          <div className="memory-readout"><span>EDGE COLUMNS</span><strong>{numeric(snapshot?.memoryEstimateMiB ?? 0)} MiB</strong></div>
        </section>
      </aside>

      <section className="world-caption">
        <p className="micro-label">CLOSED LOOP / ENVIRONMENT → SENSORS → NETWORK → MOTOR → BODY</p>
        <div className="behavior-title"><span className="state-hash">//</span><strong>{snapshot?.behavior ?? "INITIALIZING"}</strong></div>
        <p>Body motion is modelled from the live motor decoder; it is not a pre-recorded walk cycle.</p>
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
          <Stimulus label="FOOD / ODOR" value={sensor?.odor ?? 0} color="gold" onChange={(amount) => onCommand({ type: "stimulus", stimulus: "food", amount })} />
          <Stimulus label="LIGHT FIELD" value={sensor?.light ?? 0} color="gold" onChange={(amount) => onCommand({ type: "stimulus", stimulus: "light", amount })} />
          <Stimulus label="WIND VECTOR" value={sensor?.wind ?? 0} color="cyan" onChange={(amount) => onCommand({ type: "stimulus", stimulus: "wind", amount })} />
          <Stimulus label="TOUCH PULSE" value={sensor?.touch ?? 0} color="magenta" onChange={(amount) => onCommand({ type: "stimulus", stimulus: "touch", amount })} />
          <Stimulus label="TEMPERATURE" value={(sensor?.temperature ?? 0 + 1) / 2} color="cyan" onChange={(amount) => onCommand({ type: "stimulus", stimulus: "temperature", amount })} />
        </section>

        <section className="lab-pane decode-pane">
          <p className="micro-label">03 / MODELLED READOUT</p>
          <h2>Motor decode</h2>
          <DecodeBar label="FORWARD" value={motor?.forward ?? 0} />
          <DecodeBar label="TURN" value={Math.abs(motor?.turn ?? 0)} />
          <DecodeBar label="WING LIFT" value={motor?.wingLift ?? 0} />
          <p className="pane-note">Motor grouping and actuator transfer are labelled modelled mappings.</p>
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
