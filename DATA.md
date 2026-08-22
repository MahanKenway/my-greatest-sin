# Data Architecture and Provenance

## Source Scope

FlyWire’s v783 public release is the target source for the adult female *Drosophila melanogaster* connectome. FlyWire describes its public-release data as CC BY-NC 4.0 and asks users to follow its citation guidance. The paper reporting the whole-brain wiring diagram describes 139,255 neurons connected by approximately 50 million chemical synapses. [1] [2]

Digital Fly therefore does **not** ship copied connectivity data. It expects a user-selected or deployment-configured manifest that names a permitted origin, release version, checksum, schema, data-use notice, and citations. The loader validates the manifest before any binary buffers become simulation state.

## `DFLY` Pack Layout

| Section | Type | Contents | Runtime use |
|---|---|---|---|
| Header | fixed bytes | magic, format version, endian tag, release ID, counts | rejects incompatible files before allocation |
| Manifest | UTF-8 JSON | provenance, schema, checksums, chunk locations, citations | audit display and bounded range planning |
| Neuron columns | typed binary columns | stable ID, type/class index, region index, x/y/z, flags | inspection, sampled rendering, input/output mapping |
| Incoming CSR offsets | `Uint32Array` | length `neuronCount + 1` | per-target synaptic summation on GPU/CPU |
| Incoming edge columns | `Uint32Array`, `Float32Array`, `Uint16Array`, `Uint8Array` | source, weight, delay, flags | sparse propagation without nested objects |
| Optional annotations | dictionary + indexed column | source-approved labels and confidence | routing adapters and UI provenance |

The initial generic pack format is a project-owned container, not an official FlyWire file format. An adapter must transform only compatible public artifacts and record its transformation version. It must not guess absent neurotransmitter signs, delays, positions, receptor properties, or semantic motor mappings.

## Cache and Offline Policy

Chunk payloads are cached in IndexedDB under the tuple `(origin, release, transformVersion, checksum)`. The service worker and Cache Storage layer are deferred until the static simulation core is validated, but the manifest and cache keys are designed for that addition. Large state exports remain binary; JSON holds only experiment metadata and references.

The current implementation adds `scripts/data-processing/build_flywire_v783_pack.py`. It streams user-provided Feather record batches twice, emits source-preserving DFLY chunks outside the repository, writes SHA-256 values into `manifest.json`, and refuses to run without an explicit data-terms acknowledgement. The browser fetches and validates the manifest before caching any chunk. A full DFLY pack is never silently substituted for the current synthetic fixture, and cached source chunks do not automatically imply that the active neural backend is executing them.

## Provenance Labels

| Label | Meaning | Example |
|---|---|---|
| `SOURCE DATA` | Directly stored in a validated cited data product | neuron stable ID or curated region label |
| `MODELLED MAPPING` | Explicit computational assumption needed to connect data to an embodied simulation | sensor encoding gain or motor readout group |
| `SYNTHETIC TEST FIXTURE` | Deterministic non-biological data used only to test software behavior | 96-node development network |

## References

[1]: https://flywire.ai/guidelines "FlyWire citation guidelines"
[2]: https://doi.org/10.1038/s41586-024-07558-y "Dorkenwald et al. (2024), Neuronal wiring diagram of an adult brain"
