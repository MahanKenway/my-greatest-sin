# FlyWire v783 Integration Checklist

- [x] Verify current FlyWire v783 access, licensing, attribution, and citation requirements against official sources.
- [x] Specify the DFLY v1 binary chunk contract for proofread neuron IDs, CSR offsets, sources, weights, neurotransmitter probabilities, and neuropil indices.
- [x] Add a streaming, local-only converter for `proofread_root_ids_783.npy` and `proofread_connections_783.feather`.
- [x] Generate a provenance-rich `manifest.json` with chunk SHA-256 checksums and transformation metadata.
- [x] Add deterministic converter fixtures and tests without committing FlyWire data.
- [x] Add browser manifest loading, checksum validation, HTTP range fetching, IndexedDB caching, and device-memory preflight.
- [x] Surface verified dataset status, data provenance, and loader failure reasons in the simulation interface.
- [x] Update documentation with exact installation, hosting, and scientific-boundary instructions.
- [x] Run type checks, converter tests, browser-loader tests, and static build validation.
- [ ] Commit, push, checkpoint, and report the final integration path.
