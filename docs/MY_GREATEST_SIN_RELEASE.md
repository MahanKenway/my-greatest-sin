# My Greatest Sin: Public Release Scope

## Release Identity

**Title:** My Greatest Sin — Digital Fly Connectome Simulation Foundation

**Version:** `0.1.0`

**Release class:** Source-code and documentation release with a deterministic synthetic demonstration fixture. This release is not a release of FlyWire-derived connectivity, morphology, annotation, or transformed DFLY chunks.

## Approved Candidate Artifacts

| Artifact | Destination | Estimated size | License/status | Notes |
|---|---|---:|---|---|
| `my-greatest-sin-source-v0.1.0.zip` | Zenodo and Hugging Face | under 1 MiB excluding supplied visual assets | MIT source code | Portable project source, tests, converter, DFLY contract, documentation, and generated visual assets. |
| `README.md` / Dataset Card | Zenodo and Hugging Face | small | Documentation | States software scope, explicit synthetic-fixture status, and future FlyWire terms. |
| `DFLY_V1.md` | Zenodo and Hugging Face | small | Documentation | Defines the validated format and provenance contract for later user-obtained FlyWire v783 packs. |

## Excluded Artifacts

The following files must not be uploaded or represented as part of the public data release:

| Excluded item | Reason |
|---|---|
| `proofread_root_ids_783.npy`, `proofread_connections_783.feather`, any `.feather`, `.npy`, `.bin`, or converted real DFLY pack | No FlyWire source or derived data are present in this project; every future pack needs a separate license/provenance audit. |
| `.manus-logs/`, `node_modules/`, `dist/`, `__pycache__/`, temporary converter files | Build or runtime artifacts; not release material. |
| `.env*`, credentials, access tokens, browser data, and any signed URL | Private/security-sensitive material. |
| Manus project metadata and generated checkpoint artifacts | Platform-specific operational files, not portable source. |

## Hosting Role Split

Zenodo should host the citable `v0.1.0` software snapshot and associated documentation. Hugging Face should host the public, version-controlled `MahanKenway/my-greatest-sin` dataset repository containing the same source archive and Dataset Card. Neither destination should claim to host a real FlyWire pack until such a pack is separately transformed, attributed, and approved for its declared use.

## Publication Gate

Before any browser upload or public publish action, the user must see and explicitly approve the exact filenames, visibility, licenses, destinations, and metadata. Creating an empty public record or a public repository is also an external publication action and requires approval.
