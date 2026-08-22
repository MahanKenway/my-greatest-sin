# My Greatest Sin

> **My Greatest Sin** is the public identity of the Digital Fly connectome simulation foundation.

> **A browser-first observation bench for testing an explicitly modelled sensory → network → motor → body loop around a scalable adult *Drosophila* connectome data architecture.**

Digital Fly is an original TypeScript and Babylon.js project. It is designed so that a validated FlyWire data pack can be loaded as compact typed-array columns, rather than as millions of JavaScript objects. The target release described by Dorkenwald *et al.* contains 139,255 neurons and roughly 50 million chemical synapses. [1] FlyWire’s public-release guidance identifies v783 as its October 2023 snapshot and releases public data under CC BY-NC 4.0. [2]

The repository does **not** bundle FlyWire connectivity data. The currently runnable scene uses a clearly labelled 96-neuron deterministic **SYNTHETIC TEST FIXTURE** to verify the software loop. It must not be represented as biological source data or as a full-connectome simulation.

## What Runs Now

| Subsystem | Implemented behavior | Data status |
|---|---|---|
| Connectome contract | `DFLY` manifest validation, bounded counts, CSR fixture, typed columns, memory estimate | Synthetic fixture; real-pack adapter interface prepared |
| Neural engine | Preallocated leaky-integrate-and-fire CPU fallback with incoming-CSR propagation and deterministic tests | Modelled dynamics |
| GPU pathway | Browser capability detection and a documented portable incoming-CSR compute design | WebGPU kernel staged; not yet activated for a full pack |
| Embodiment | Procedural fly, food/light/wind/touch/temperature field controls, motor-controlled body motion | Modelled mapping |
| Visualization | Babylon sampled brain cloud, live activity readout, spike-density timeline, provenance labels | Sampled synthetic activity |
| Offline shell | Static service worker caches the UI shell; large validated data cache is architected but deferred | Partial |

## Run Locally

Use Node.js 22 and pnpm 10 or a compatible recent release.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm dev
```

Open the local Vite address and use `?demo` to start the deterministic stimulus sequence immediately. The ordinary page remains interactive: use **AUTO DEMO**, environmental sliders, **PAUSE**, **STEP 5 MS**, and **RESET** to inspect causal changes in the sensor, neural, motor, and body displays.

```bash
pnpm build
pnpm preview
```

## Architecture

React only owns the full-screen canvas lifecycle and DOM laboratory HUD. Framework-independent gameplay modules live under `client/src/game/`. `GameWorld` owns a fixed simulation clock and runs the causal order `Arena → SensorFrame → NeuralEngine → MotorFrame → FlyBody → Arena`. Rendering time and simulation time are separated.

The intended full pack uses immutable neuron columns plus incoming CSR edge columns. This avoids nested graph objects and permits a portable WebGPU strategy in which one invocation owns one postsynaptic target and iterates its incoming edges, avoiding universal float-atomic assumptions. See [ARCHITECTURE.md](ARCHITECTURE.md), [DATA.md](DATA.md), and [PLAN.md](PLAN.md) for the full contracts and risk slices.

## Data Use and Attribution

Obtain FlyWire data only from permitted sources and retain source versions, checksums, citations, attribution, and data-use conditions in every experiment. Do not upload a public release artifact into this repository without verifying its terms and size suitability. The project’s own MIT license covers only original source code; it does not grant rights to scientific data or reference-project code.

The planned loader labels every value as `SOURCE DATA`, `MODELLED MAPPING`, or `SYNTHETIC TEST FIXTURE`. Read [SCIENTIFIC_LIMITATIONS.md](SCIENTIFIC_LIMITATIONS.md) before conducting or presenting experiments.

## Install a User-Obtained FlyWire v783 Pack

The repository now includes a local-only converter for the official `proofread_root_ids_783.npy` and `proofread_connections_783.feather` artifacts. It does not download FlyWire data, upload data, or permit output inside this source repository. Review the current data-use terms first, obtain the source files through an allowed route, and then run:

```bash
python3 scripts/data-processing/build_flywire_v783_pack.py \
  --root-ids /path/to/proofread_root_ids_783.npy \
  --connections /path/to/proofread_connections_783.feather \
  --out-dir /path/outside-the-repository/flywire-v783-dfly \
  --accept-flywire-terms
```

The command writes a checksummed `manifest.json` and independently verifiable binary chunks. Host that output on a CORS-enabled static host. In Digital Fly, choose **VERIFY PACK**, paste the `manifest.json` URL, inspect the provenance and device-memory result, then use **CACHE** to stage verified chunks in IndexedDB. Query form `?pack=https://host.example/flywire-v783-dfly/manifest.json` performs the same inspection on startup.

The browser loader validates the manifest and caches chunks, but it intentionally does not activate a real full pack in the current LIF scene. Activation remains blocked until the sparse WebGPU backend and a release-specific model mapping have been benchmarked. Full instructions are in [docs/DFLY_V1.md](docs/DFLY_V1.md) and [docs/HOSTING_DFLY_PACKS.md](docs/HOSTING_DFLY_PACKS.md).

## Deployment

`pnpm build` emits a static `dist/public` directory. The checked-in [GitHub Pages workflow](.github/workflows/deploy.yml) runs the type check, tests, and build before publishing on pushes to `main`. For Cloudflare Pages, set build command to `pnpm install --frozen-lockfile && pnpm build` and output directory to `dist/public`; `wrangler.toml` records the same output path.

The visual assets used during managed development are supplied through managed storage URLs. For an independently hosted GitHub Pages or Cloudflare Pages deployment, replace those URLs with permitted, publicly hosted copies before release; otherwise only the procedural fallback materials will be available. This is intentional: no generated images or large datasets are committed to the project tree.

## Expected Performance and Browser Support

Chrome or Chromium with WebGPU is the target for eventual full-pack compute. The current fixture runs in the deterministic typed-array fallback on all modern browsers that support WebGL2. The full graph’s compact edge columns alone are estimated at roughly 524.52 MiB for 50 million synapses before GPU duplication, so browser memory limits, GPU buffer limits, range fetching, and chunk scheduling must be validated per device. The app must warn instead of claiming acceptable full-pack performance on an unsupported device.

## Roadmap

The next milestones are a release-compatible FlyWire transform, streamed checksum-validated chunks and IndexedDB caching, an activated WebGPU sparse LIF kernel, curated sensory/descending/motor annotations, separately licensed high-detail biomechanics, weight-delta plasticity, binary experiment export, and reproducible browser benchmarks. Each milestone is already represented in the architecture, but none should be described as finished until independently measured and documented.

## References

[1]: https://doi.org/10.1038/s41586-024-07558-y "Dorkenwald et al. (2024), Neuronal wiring diagram of an adult brain"
[2]: https://flywire.ai/guidelines "FlyWire citation guidelines"
[3]: https://doi.org/10.1038/s41592-024-02497-y "Wang-Chen et al. (2024), NeuroMechFly v2"
[4]: https://github.com/FlyBrainLab/FlyBrainLab "FlyBrainLab"
