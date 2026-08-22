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
- [x] Commit, push, checkpoint, and report the final integration path.

## Zero-Cost Remote-Pack Revision

- [ ] Research current no-cost remote hosts that can retain a large research dataset without relying on the user’s computer.
- [ ] Verify each candidate’s storage, bandwidth, public-download, CORS, and range-request limitations.
- [ ] Select a compatible free delivery model that respects FlyWire public-release use terms.
- [ ] Adapt the pack manifest and loader documentation for the selected host.
- [ ] Re-run loader, type, and production-build validation before publishing the remote-hosting revision.

## Logged-In Free-Hosting Setup

- [ ] Confirm the user’s active Zenodo and Hugging Face accounts in the browser.
- [ ] Compare public dataset-record and dataset-repository controls against the DFLY manifest requirements.
- [ ] Prepare, but do not publish, the selected record or repository metadata.
- [ ] Ask for explicit confirmation before creating a public record, uploading data, or publishing the dataset.

## My Greatest Sin Publication

- [x] Inventory every candidate source, bundle, generated asset, and dataset artifact with size and origin.
- [x] Exclude synthetic fixture internals, local development artifacts, secrets, and unlicensed source data from public release bundles.
- [x] Prepare a Hugging Face dataset card and Zenodo metadata/citation package for the approved release scope.
- [x] Prepare a portable Hugging Face Static Space build with bundled public visual assets.
- [x] Prepare a public Hugging Face dataset repository card that reserves the future DFLY-pack location without claiming to contain FlyWire data.
- [ ] Present exact filenames, sizes, visibility, licenses, and destination records for final approval.
- [ ] Create public records and upload only the approved files after final browser confirmation.
- [ ] Verify both published destinations and document the public URLs in the project.

## Whole-Brain Organism Simulation Revision

- [x] Inspect the user-selected GitHub repositories for existing whole-brain, connectome, neural-simulation, or organism-simulation assets and licenses.
- [x] Research public animal whole-brain datasets with explicit provenance, access terms, download format, and redistribution restrictions.
- [x] Compare viable candidates by neuron count, connection coverage, behavioural/body-model availability, browser delivery size, and scientific limitations.
- [x] Select a data/model boundary that does not claim consciousness, literal life, or biological validity beyond the evidence.
- [x] Draft a staged implementation plan for loading the selected data and coupling it to an explicit modelled sensory-motor body.

## Dual-Species Embodiment Revision

- [x] Define provenance, license, format, optimization, and attribution criteria for third-party 3D assets.
- [x] Find and verify a downloadable, redistributable 3D fly body source suitable for Babylon.js conversion.
- [x] Find and verify a downloadable, redistributable 3D C. elegans body source suitable for Babylon.js conversion.
- [x] Add a typed species profile and a visible species-selection control without implying that either organism is biologically alive.
- [x] Integrate lightweight three-dimensional bodies, distinct locomotion, source labels, and shared camera framing for both species.
- [x] Run browser, type, test, build, and visual validation before checkpointing the dual-species revision.
- [ ] Convert and simplify the externally sourced high-detail body meshes into attributed GLB assets before any future raw-mesh replacement.
