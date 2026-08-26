# Digital Fly Structure

## Runtime Boundary

```text
React frame (one full-screen GameCanvas)
  └── Babylon Scene / GameWorld (rendering, camera, UI overlay positions)
       ├── SimulationLoop (fixed deterministic time, separate render cadence)
       ├── ConnectomeRuntime (source pack + immutable columns + indexed views)
       │    ├── PackManifest / BinaryReader / ChunkCache
       │    └── ValidationReport (data provenance and device preflight)
       ├── NeuralEngine (selects WebGPU LIF or deterministic typed-array fallback)
       ├── SensorSuite (environment fields → labelled input drives)
       ├── MotorDecoder (labelled readout groups → body commands)
       ├── SpeciesProfile (labelled fixtures, body label, source/licence context)
       ├── FlyBody (procedural mesh + modelled kinematics/dynamics)
       ├── WormBody (segmented procedural mesh + modelled undulation)
       ├── Arena (food, light, wind, wall, touch, temperature, odor fields)
       │    └── GardenScenery (procedural habitat + sky rig; visual-only `MODELLED MAPPING`)
       ├── WormNavigator (C. elegans-only multi-food selection, bounded memory, rest/exploration, forage-rock avoidance and modelled steering)
       ├── BrainView (sampled thin instances, region summaries, selection)
       └── ExperimentStore (commands, seeded events, export/replay metadata)
```

## Data Contracts

| Contract | Main contents | Provenance rule |
|---|---|---|
| `ConnectomeManifest` | dataset ID, FlyWire version, origin URL, license notice, schema, chunk checksums, counts | Required for all real data; never fabricate values. |
| `ConnectomeColumns` | typed arrays for IDs, region indices, class/type indices, positions, offsets, edge columns | Immutable source layer once validated. |
| `NeuralState` | membrane voltage, refractory clock, input, spikes, original/learned weight delta | Dense preallocated runtime layer; no object-per-neuron state. |
| `SensorFrame` | visual, touch, proprioception, odor, taste, temperature, wind, light values | Every channel carries `SOURCE`, `MODELLED`, or `SYNTHETIC` status. |
| `MotorFrame` | gait phase, stride, turn, wing lift, head pose, proboscis amount | A decoder output, explicitly modelled until source mapping is curated. |
| `SpeciesProfile` | species ID, display label, context, source summary, body characteristics | Selects presentation/modelled body only; it does not assert a real neural-data pack is executing. |
| `ExperimentRecord` | seed, environmental events, metadata, small UI settings, optional binary state reference | Text JSON only for small metadata; binary chunks for large state. |

## Planned Directory Map

```text
client/src/
  components/
    GameCanvas.tsx          React lifecycle ownership only
  game/
    scene.ts                Babylon scene assembly
    GameWorld.ts            fixed-step owner
    shared/
      types.ts              strict data types and provenance markers
      rng.ts                seeded deterministic PRNG
    connectome/
      manifest.ts           binary manifest validation
      binaryReader.ts       bounded typed-array decoding
      fixture.ts            disclosed synthetic test pack
      cache.ts              IndexedDB chunk cache (future integration)
    neural/
      engine.ts             backend selection facade
      lifCpu.ts             deterministic fixed-array fallback
      webgpu.ts             portable GPU compute implementation
    sensors/
      SensorSuite.ts        field sampling and input encoding
    body/
      FlyBody.ts            procedural geometry and causal body update
      WormBody.ts           segmented body and causal undulation update
      types.ts               common BodyController interface
      MotorDecoder.ts       sampled/annotated output → actuator command
    environment/
      Arena.ts              stimulus fields and collision limits
      GardenScenery.ts      asynchronous GLB habitat composition and decorative lighting
      gardenAssets.ts       managed-storage URLs for the selected CC0 models
    visualization/
      BrainView.ts          sampled activity and region summaries
      TimelineView.ts       spike raster and signal traces
    experiments/
      ExperimentStore.ts    commands, history, export/replay
```

## Asset Hints

The scene uses procedural meshes for the fly, worm, stimulus fields, and neural markers so their state is always causal and inspectable. A visual-only `GardenScenery` layer asynchronously imports a small selection of CC0 Kenney Nature Kit GLBs—trees, foliage, rocks, flowers, water-adjacent props, a log, and path stones—from managed storage. These assets decorate the habitat edge and never affect sensing, collision, movement, network execution, or source-data claims. Generated textures provide the material character: a 2 m repeating floor; two 0.85 m translucent wing surfaces; a 300 px atlas reference; and a 36 px logo aperture. Future optimized mesh references are NeuroMechFly (Apache-2.0) for the fly and OpenWorm Worm Browser (MIT) for the worm; no downloaded FlyWire morphology or texture is embedded in the source tree.

## Determinism Policy

Simulation time advances in fixed `dt` increments under a seeded PRNG. Rendering may interpolate body and camera state but never mutates the simulation. A demo mode replays an event list rather than choosing random actions at render time. GPU and CPU modes expose their backend identity and do not claim bitwise equivalence until platform-specific validation establishes it.

## Garden Presentation Contract

`Arena` owns the `EnvironmentPresentation` bridge. Its daylight value drives only the `GardenScenery` sky rig and named presentation lights: dawn panorama, night panorama, sun, moon, stars, fireflies and material tint. `GardenScenery` owns all decorative meshes and must not call `Arena.sample`, `GameWorld`, neural code or body controllers. `SimulationHud` only dispatches the existing typed `environment` command and reads the species/runtime state from `SimulationSnapshot`.

## C. elegans Navigation Contract

`WormNavigator` runs only after the active C. elegans source topology produces its ordinary `MotorFrame`. It receives a modelled food-bearing/target-distance observation and a modelled forage-rock proximity observation from `Arena`, then limits its steering correction and forward speed before `WormBody` updates. The same obstacle proximity also contributes to the existing reactive sensory input. The source graph, edge columns and neuron counts are never changed; food seeking, collision zone, motor merge and body translation are all visibly `MODELLED MAPPING`.

`WormNavigator` retains at most twelve sampled path points and four food-visit entries. Those buffers are per-session, resettable and never serialised as biological memory. They control target recency, a short rest interval after feeding and a deterministic exploration arc only when every food field is below threshold. `WormBody` smooths the final modelled turn/stride signal; it does not alter neural activity or source edges.
