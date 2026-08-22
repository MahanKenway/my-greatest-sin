# DFLY v1: FlyWire v783 Proofread-Connections Pack

## Scope and Boundary

This specification describes a project-owned binary container derived from a permitted FlyWire v783 data product. It is **not** an official FlyWire format and must retain the source release, data-use notice, citations, transform version, source URLs, and SHA-256 values in its manifest. FlyWire states that public-release data are available under CC BY-NC 4.0 and identifies v783 as the October 2023 public snapshot. [1]

The first adapter accepts two user-obtained files from the official whole-brain connectivity release: `proofread_root_ids_783.npy` and `proofread_connections_783.feather`. The connections table is already summarized by presynaptic neuron, postsynaptic neuron, and neuropil. It includes a source synapse count and averaged transmitter probabilities. [2]

This pack does not infer neuron biophysics, neurotransmitter sign, synaptic delay, cell morphology, sensory identity, or motor identity. It stores source measurements and annotation columns. Any runtime conversion from source fields to LIF weights, delays, excitatory/inhibitory signs, or embodiment mappings remains a separately versioned `MODELLED MAPPING`.

## Required Manifest Fields

```json
{
  "format": "DFLY",
  "formatVersion": 1,
  "datasetId": "flywire-v783-proofread-connections",
  "release": "783",
  "origin": "https://zenodo.org/records/10676866",
  "license": "CC BY-NC 4.0",
  "provenance": {
    "sourceFiles": [],
    "citations": [],
    "transform": { "name": "digital-fly-build-v783-pack", "version": "1" }
  },
  "neuronCount": 0,
  "synapseCount": 0,
  "columns": {},
  "chunks": []
}
```

`chunks` is a flat integrity index used by the browser cache. `columns` maps each named binary column to its scalar type, element count, semantic status, and ordered chunk IDs. Every chunk includes `path`, `bytes`, `sha256`, `elementOffset`, and `elementCount`; edge columns additionally include `edgeOffset` and `edgeCount`.

## Required Source-Preserving Columns

| Logical column | Scalar type | Semantics | Required |
|---|---:|---|---|
| `root_id` | `u64` | Source FlyWire proofread root ID, indexed by compact internal neuron index | Yes |
| `incoming_offsets` | `u32` | CSR edge boundaries for each target internal index | Yes |
| `source_index` | `u32` | Compact presynaptic index for each incoming edge | Yes |
| `synapse_count` | `u32` | Source `syn_count` for the summarized pre/post/neuropil row | Yes |
| `neuropil_index` | `u16` | Index into the manifest neuropil dictionary | Yes |
| `nt_probabilities` | `f16` × 6 | Ordered `gaba`, `ach`, `glut`, `oct`, `ser`, `da` source probabilities | When all six source columns exist |

The first production pack uses **incoming CSR** so a CPU or WebGPU invocation owns one postsynaptic neuron and can scan a contiguous edge interval. This avoids global nested graph objects and does not rely on cross-invocation floating-point atomics.

## Conversion Process

The converter makes two sequential passes over the Feather record batches. First, it validates required columns, maps source root IDs to compact indices, records the neuropil dictionary, and counts valid incoming edges by postsynaptic index. It then writes CSR offsets. The second pass writes each valid edge into its preallocated target interval through typed memory-mapped files. Final columns are split into independently checksummed chunks. The converter neither downloads from FlyWire nor uploads output; both actions remain user-controlled.

## Browser Loading Contract

The browser first downloads the manifest, validates bounds and provenance, and calculates a conservative memory estimate. Chunks are fetched from a CORS-enabled static host, optionally through HTTP `Range` requests when a manifest describes a byte range. Data are cached in IndexedDB under dataset ID, transform version, chunk ID, and checksum. A chunk is usable only after its SHA-256 matches the manifest. The current browser integration validates and stages a pack; full graph execution remains disabled until the full WebGPU sparse backend is benchmarked on the current device.

## References

[1]: https://flywire.ai/guidelines "FlyWire citation guidelines"
[2]: https://zenodo.org/records/10676866 "FlyWire Whole-brain Connectome Connectivity Data"
