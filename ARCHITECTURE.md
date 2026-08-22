# Architecture

Digital Fly has a deliberately narrow claim: it provides a browser-native software architecture in which a verified full-connectome pack can participate in an embodied loop. It does not equate a structural graph with a complete organism. The architecture therefore separates immutable cited columns, mutable simulation state, and explicitly modelled sensor/motor/body adapters.

## Layers

| Layer | Ownership | Constraint |
|---|---|---|
| React shell | `GameCanvas` and `SimulationHud` | Owns canvas lifecycle and conventional browser controls only. |
| Babylon scene | `scene.ts` and `GameWorld` | Owns camera, mesh lifecycle, lighting, and visual updates. |
| Connectome runtime | `connectome/*` | Validates source manifests and exposes typed immutable columns. |
| Neural runtime | `neural/*` | Preallocates dense state and selects CPU/WebGPU backend without changing caller contracts. |
| Embodiment | `environment/*`, `sensors/*`, `body/*` | Uses labelled `MODELLED MAPPING` adapters until curated source mappings exist. |
| Experiment record | `experiments/*` | Stores human-readable metadata separately from binary neural state. |

## Fixed Step

Simulation advances in fixed 5 ms increments. Render time is capped and may execute several simulation increments per display frame. The update order is deterministic: sample the arena at the fly’s pose, encode sensors, update the neural engine, decode modelled motor values, apply them to the fly body, and write bounded telemetry. Rendering does not modify neural state.

## Full-Pack Data and Compute Plan

The production loader will accept a manifest and independent binary chunks. Neuron metadata uses compact indexed columns. Incoming CSR offsets partition edge columns by postsynaptic target. The portable GPU pass is therefore one target per invocation: it reads a known contiguous input range and produces one summed input without requiring cross-thread floating-point atomics. A second pass performs LIF update, threshold, refractory handling, and ping-pong state writes. Device preflight will expose buffer and memory limitations before download.

Real source weights remain immutable. Future learning stores a separate delta column and a resettable experiment record. The original topology and data-provided attributes are never overwritten by an experiment.

## Scientific Boundaries

The procedural fly and environmental field are software model components inspired by the embodied framing of NeuroMechFly v2, which itself is a separate research framework for adult Drosophila sensorimotor simulation. [1] No code, body assets, validation result, or performance claim from that work is reused here. See [SCIENTIFIC_LIMITATIONS.md](SCIENTIFIC_LIMITATIONS.md) and [DATA.md](DATA.md).

## Reference

[1]: https://doi.org/10.1038/s41592-024-02497-y "Wang-Chen et al. (2024), NeuroMechFly v2"
