# Game Plan: Digital Fly

## Risk Tasks

### 1. Full-Scale Connectome Pack Validation

- **Why isolated:** The target release is approximately 139,255 neurons and 50 million chemical synapses, so a naive JSON graph or an object-per-neuron representation would exhaust browser memory and garbage-collection budget. The compact edge columns alone require approximately 524.52 MiB at 50 million edges before runtime and GPU duplication.
- **Approach:** Define a versioned `DFLY` binary manifest format with independent, checksum-verified chunks. Use an incoming CSR layout (`target offsets` plus source/weight/delay columns) for parallel postsynaptic accumulation, separate flat neuron metadata columns, range fetches when the host supports them, and IndexedDB chunk caching. Refuse unverified files, publish a preflight memory estimate, and never label a developer fixture as FlyWire source data.
- **Verify:** A deterministic test fixture loads without per-neuron objects; invalid magic/version/checksum files return a named error; a 139,255-neuron manifest passes metadata and memory-budget validation without attempting an unbounded download.

### 2. WebGPU LIF Update and Fallback Selection

- **Why isolated:** GPU sparse propagation must avoid allocating per tick, account for WebGPU adapter limits, and preserve a meaningful fallback when WebGPU is unavailable. Atomic floating-point synaptic summation is not a universal WebGPU guarantee, so the first portable implementation must not silently depend on it.
- **Approach:** Allocate neuron state in fixed ping-pong storage buffers and use an incoming-CSR compute pass: one invocation per postsynaptic neuron walks its incoming edges and writes one input value, eliminating cross-thread float atomics. Use a second compute pass for LIF membrane/refractory/spike updates. Capability-gate this backend, and provide a deterministic chunked `TypedArray`/worker-compatible LIF backend for fixtures and compatibility mode.
- **Verify:** The selected backend and reason are visible in the HUD; repeated seeded fixture runs yield equal spike counts and body trajectories; capability loss switches to the fallback with a clear warning instead of a crash.

### 3. Modelled Body and Sensor-Motor Closed Loop

- **Why isolated:** The FlyWire graph does not by itself supply a browser-ready musculoskeletal body, exhaustive sensor mappings, or validated motor decoder. A visually impressive fly can accidentally become a scripted animation if the causal data flow is not explicit.
- **Approach:** Build a procedural six-legged fly with a small planar dynamics controller, passive antenna/wing motion, and collision-aware arena limits. Route food, light, wind, touch, temperature, smell, and obstacle fields through labelled sensor adapters, then use a labelled motor decoder to generate forward, turn, lift, and gait commands. The body must respond to decoder output every simulation step; the adapter remains `MODELLED` until a curated source annotation mapping is installed.
- **Verify:** In `?demo` mode, a reproducible food/light gradient changes sensor channels, changes neural fixture output, and moves the body; a sudden wind pulse changes the motor readout and body orientation; the UI identifies the mapping as modelled.

### 4. Dense Brain Visualization Without Per-Neuron DOM

- **Why isolated:** Rendering every biological neuron and synapse at all times would obscure the simulation and breach browser frame budgets. A brain image must remain useful even when a full data pack is not available.
- **Approach:** Use Babylon thin instances for sampled neurons and one batched line system for sampled active pathways. Add a region aggregate view and a programmatic spike raster. Level-of-detail switches from region summaries to sampled cells only when the inspector is open; no neuron maps are constructed with DOM elements.
- **Verify:** The left rail shows active clusters and a current selected-region summary; the number of rendered markers is capped and stated; increasing simulated population does not create additional DOM nodes per neuron.

### 5. Dual-Species Embodiment and Selection

- **Why isolated:** The project must show a fly and a C. elegans side by side as independent modelled organisms without treating either body, fixture, or motion as biological source data. Switching bodies must not create a second Babylon engine or leave hidden meshes updating.
- **Approach:** Add a typed `SpeciesId` command and profile, retain one `GameWorld`, and activate exactly one body at a time. The fly uses the existing causal six-legged body while the worm uses a low-allocation segmented body with a motor-driven travelling wave. The reference source for a future optimized fly mesh is NeuroMechFly (Apache-2.0); the source for worm anatomy/layers is OpenWorm Worm Browser (MIT).
- **Verify:** A visible HUD selector changes the active specimen, movement readout and contextual label; both bodies respond to the same decoder contract but with species-appropriate modelled motion; reset restores the active specimen without resource leaks.

## Main Build

My Greatest Sin will ship as a browser-first, static React/Babylon application where React supplies a single full-screen laboratory frame and framework-independent TypeScript modules under `client/src/game/` own the simulation. The first visible build uses a deterministic `SYNTHETIC TEST FIXTURE` for proof of a closed loop while the data loader is designed to accept a real release manifest from a permitted host. The observation bench supports both a fly and a C. elegans body; this is not a substitute for FlyWire or C. elegans source data and will say so in every relevant panel.

The interface follows the visual target: a central specimen arena, a left brain observation rail, a right experimental control rail, and a bottom neural timeline. Controls include pause/resume, reset, one-step, deterministic demo, food, wind, light, touch, and temperature inputs. The release includes file import/export for small experiment descriptions, browser capability reporting, a benchmark page/panel, and source/model provenance labels.

- **Assets:**
  - `digital-fly-specimen-floor.png` — 2 m tile on the central arena ground.
  - `digital-fly-wing-texture.png` — 0.85 m wing texture for each procedural wing mesh.
  - `digital-fly-brain-map.png` — 300 px reference atlas beneath programmatic sampled neuron points.
  - `digital-fly-mark.png` — 36 px HUD brand aperture.
  - `digital-fly-visual-target.png` — 16:9 calibration reference in the connectome-load empty state.
- **Verify:**
  - The fly’s movement is a direct function of the decoded motor vector rather than a timer-driven canned locomotion animation.
  - Stimulus controls alter the data shown in the sensor, neural, motor, and timeline views.
  - UI labels remain readable, with no overflow or overlap on desktop and compact layouts.
  - No missing texture, fallback material, console error, or undisclosed synthetic data claims appear in capture.
  - Reference consistency: basalt navy laboratory ground, active magenta axon traces, cyan output, gold stimulus, and asymmetrical observation rails.
  - `?demo` produces a reproducible running experiment suitable for browser capture.

## Deferred Milestones (Architecturally Accounted For)

1. Full official release ingestion and validation against an approved FlyWire v783 artifact.
2. WebGPU compute activation on a live full-scale pack after browser limit testing.
3. Chunked, persistent dataset download and offline service-worker cache.
4. High-detail biomechanical integration with a separately licensed/exported body source.
5. Curated sensory, descending, and motor annotations; explicit evaluation protocols.
6. STDP and neuromodulated delta buffers that preserve immutable source weights.
7. GitHub Pages and Cloudflare Pages release automation after public repository creation.
