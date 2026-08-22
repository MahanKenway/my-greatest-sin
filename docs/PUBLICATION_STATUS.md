# My Greatest Sin Publication Status

## Public Destinations

| Destination | URL | Status |
|---|---|---|
| Hugging Face Space | https://huggingface.co/spaces/MahanKenway/my-greatest-sin | Created public; portable static application uploaded and its final asset tree verified. |
| Live static application | https://mahankenway-my-greatest-sin.static.hf.space/index.html | Verified DOM boot: canvas and scientific HUD render. |
| Hugging Face dataset repository | https://huggingface.co/datasets/MahanKenway/my-greatest-sin | Created public; the Dataset Card, DFLY contract, MIT license, and 24.3 MB source archive were verified. |
| Zenodo draft | https://zenodo.org/uploads/22059888 | Public software draft prepared; not yet published. |

## Zenodo Metadata Approved by the User

| Field | Value |
|---|---|
| Creator | Mahan Tavakoli |
| Title | My Greatest Sin: Digital Fly Connectome Simulation Foundation |
| Resource type | Software |
| License | MIT License |
| Visibility | Public |
| Release description | Explicitly identifies the 96-neuron fixture as synthetic and excludes real FlyWire data. |

## Verified Hugging Face Space Assets

The public Space asset tree at commit `3c04964` contains the consolidated runtime `index-Dp7FtSHX.js`, stylesheet `index-B5rrMGDh.css`, and the five release visuals: `digital-fly-brain-map.png`, `digital-fly-mark.png`, `digital-fly-specimen-floor.png`, `digital-fly-visual-target.png`, and `digital-fly-wing-texture.png`.

## Verified Hugging Face Dataset Contents

The public Dataset repository at commit `fdc9f14` contains `README.md`, `DFLY_V1.md`, `LICENSE`, and `my-greatest-sin-source-v0.1.0.zip` (24.3 MB). Its public metadata includes the English language, MIT license, and `drosophila`, `connectomics`, `neuroscience`, `simulation`, and `webgpu` tags.

## Zenodo Files and Current State

The intended record contains `my-greatest-sin-source-v0.1.0.zip`, `README.md`, `DFLY_V1.md`, `LICENSE`, and `zenodo-metadata.json`. The initial grouped transfer left four invalid `Pending` placeholders, which were removed individually without affecting the finalized `README.md` entry. The source archive was then retried as one isolated upload; Zenodo accepted the client transfer and shows it at 100%, but it still reports `Checksum not yet calculated` and `N/A` size. A direct, CSRF-authenticated retry to Zenodo's observed draft-file content endpoint exceeded browser automation's request timeout and the draft file remained `pending` at zero bytes. **Do not publish until the archive and every supporting document have finalized checksums and non-zero expected sizes.**

The archive SHA-256 prepared for the approved release is:

```text
d290edb388175e4dc54d4c0ef828cf375eb3cea9a0c3fe1b2833c1455470bced
```

## External Sources

- Zenodo deposit UI and draft state: https://zenodo.org/uploads/22059888
- Hugging Face Space repository: https://huggingface.co/spaces/MahanKenway/my-greatest-sin
- Hugging Face dataset repository: https://huggingface.co/datasets/MahanKenway/my-greatest-sin
