# Digital Fly Asset Manifest

## Art Direction

**Luminous Connectome Lab** uses a basalt-navy research-instrument field, specimen-ivory labels, muted smoky panels, and visibility that is earned by meaningful live state. Axonal Magenta (`#FF3D8D`) is reserved for spikes and active pathways; glial cyan represents derived output; photoreceptor gold represents environmental stimulus. The visual system must never imply that data are biological when they are modelled or synthetic.

## Generated Assets

| Asset | Role | Intended size | Source URL | Integration |
|---|---|---|---|---|
| `digital-fly-visual-target.png` | Mandatory visual QA reference | 480 × 270 px calibration pane | `/manus-storage/digital-fly-visual-target_03e6dd46.png` | Used as the empty-state / calibration reference in the loader panel and as visual fidelity target, not as an in-scene sprite. |
| `digital-fly-specimen-floor.png` | Mineral arena ground texture | 2 m repeat tile | `/manus-storage/digital-fly-specimen-floor_c2cc3595.png` | Tiled on a Babylon ground plane. |
| `digital-fly-wing-texture.png` | Transparent procedural wing texture | 0.85 m long on each wing | `/manus-storage/digital-fly-wing-texture_02c80633.png` | Applied to the procedural wing meshes. |
| `digital-fly-brain-map.png` | Brain-activity texture | 300 × 300 px atlas panel | `/manus-storage/digital-fly-brain-map_8c20bc49.png` | Used as the background reference for the UI brain atlas; actual active points remain programmatic. |
| `digital-fly-mark.png` | Digital Fly aperture mark / favicon source | 36 × 36 px HUD mark | `/manus-storage/digital-fly-mark_36065411.png` | Used in top-level HUD and supplied as the externally hosted brand mark. |

## External Body References

| Asset family | Source | License | Intended integration | Attribution requirement |
|---|---|---|---|---|
| Drosophila body components | [NeLy-EPFL/NeuroMechFly](https://github.com/NeLy-EPFL/NeuroMechFly) | Apache-2.0 | Optional optimized GLB assembled from source body-part meshes; procedural body remains the low-risk first integration. | Preserve the Apache-2.0 notice and cite NeuroMechFly. |
| C. elegans anatomy/layers | [openworm/wormbrowser](https://github.com/openworm/wormbrowser) | MIT | Inform a lightweight segmented worm body and future optimized mesh extraction. | Preserve the MIT notice and cite OpenWorm Worm Browser. |

## Conversion Staging

The source `Thorax.stl` from NeuroMechFly was converted outside the repository into `fly-thorax.glb` (464 KiB) with Assimp, preserving Apache-2.0 attribution. It is intentionally not yet substituted into the articulated procedural fly: a single thorax mesh would degrade the coherent existing body without an authored assembly/rig. Virtual Worm uses a legacy `utf8` geometry format, so its future GLB extraction remains an explicit conversion task rather than a misleading claim of a raw-mesh integration.

## Build Rules

The generated assets are stored outside the repository and referenced only through the stable manuscript storage URLs above. They may establish aesthetic direction but they do not represent biological imagery or scientific data. Any modelled geometry, neural state, or environment data presented beside them will carry explicit provenance labels in the UI.
