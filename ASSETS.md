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
| `luminous-garden-art-direction.png` | Garden lighting, density and composition reference | 16:9 art-direction reference | `/manus-storage/luminous-garden-art-direction_8066b9bf.png` | Used as the visual target for the CC0 model selection and night-garden staging; it is not rendered as a scene sprite. |

## External Body References

| Asset family | Source | License | Intended integration | Attribution requirement |
|---|---|---|---|---|
| Drosophila body components | [NeLy-EPFL/NeuroMechFly](https://github.com/NeLy-EPFL/NeuroMechFly) | Apache-2.0 | Optional optimized GLB assembled from source body-part meshes; procedural body remains the low-risk first integration. | Preserve the Apache-2.0 notice and cite NeuroMechFly. |
| C. elegans anatomy/layers | [openworm/wormbrowser](https://github.com/openworm/wormbrowser) | MIT | Inform a lightweight segmented worm body and future optimized mesh extraction. | Preserve the MIT notice and cite OpenWorm Worm Browser. |

## Garden Asset Sources

| Asset family | Source | License | Intended garden role | Selection boundary |
|---|---|---|---|---|
| Trees, flowers, rocks, grass and bushes | [Quaternius Stylized Nature MegaKit](https://quaternius.com/packs/stylizednaturemegakit.html) | CC0 | Preferred visual vocabulary for a lush, stylized habitat. | Select only a small subset of glTF/GLB meshes after checking texture references, triangle count and per-file size. |
| Vegetation, stones, terrain and water-adjacent props | [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) | CC0 | Broad fallback library for habitat dressing and small sensory-prop replacements. | Use only optimized individual models; never commit the downloaded source archive or the full pack. |

The planned environment clusters are: a sheltered flowering grove around the specimen, a stone-and-moss border to make the arena feel grounded, a small water/reflective habitat zone, and clear three-dimensional representations of the food, light and wind stimuli. All garden geometry remains `MODELLED MAPPING`; it decorates the observation environment and is not biological or source data.

### Selected Kenney GLB Models

The active selection is **16 small GLB files** (about 172 KiB in total): oak, pine and small trees; detailed bush and two grass forms; large and small rocks; lily, mushrooms and log; three flower forms; and two stone-path forms. They are individually hosted in managed project storage rather than bundled from the source archive, so the application uses only the models visible in the garden.

## Complete Specimen-Body Replacement Plan

| Specimen | Visual source and license | Runtime boundary | Optimization target |
|---|---|---|---|
| Drosophila | A neutral full-body assembly derived outside the repository from the Apache-2.0 NeuroMechFly component meshes and their supplied SDF pose. | The mesh is a **modelled presentation**; it is not FlyWire morphology and does not change the staged FlyWire execution boundary. | One compact GLB with a root transform that preserves the existing modelled motor-controller interface. |
| C. elegans | A custom compact full-body GLB informed by the MIT-licensed OpenWorm WormBrowser visual reference. The legacy WormBrowser `utf8` geometry is not passed through or represented as an imported raw mesh. | The mesh is a **modelled presentation**; the 279-neuron source topology remains independently labelled and executed. | One compact, smooth tapered GLB with a root transform that preserves the existing modelled locomotion interface. |

The garden extension uses the existing CC0 Kenney asset family for a wood bridge, while its waterfall is a procedural, decorative water form. Grass sway and firefly drift are render-time presentation effects, never sensory inputs or neural outputs.

The generated fly GLB contains 82,654 vertices and 57,722 faces before web delivery (about 2.0 MiB); it is assembled only from the NeuroMechFly Apache-2.0 STL components and its resting SDF pose. The generated worm GLB contains 504 vertices and 980 faces (about 21 KiB), is original presentation geometry, and references—rather than embeds—the MIT-licensed OpenWorm WormBrowser visuals. The checked source pages are [NeuroMechFly](https://github.com/NeLy-EPFL/NeuroMechFly), [FlyBody](https://github.com/TuragaLab/flybody) as a corroborating Apache-2.0 complete-body source, and [OpenWorm](https://github.com/openworm/OpenWorm).

## Conversion Staging

The source `Thorax.stl` from NeuroMechFly was converted outside the repository into `fly-thorax.glb` (464 KiB) with Assimp, preserving Apache-2.0 attribution. It is intentionally not yet substituted into the articulated procedural fly: a single thorax mesh would degrade the coherent existing body without an authored assembly/rig. Virtual Worm uses a legacy `utf8` geometry format, so its future GLB extraction remains an explicit conversion task rather than a misleading claim of a raw-mesh integration.

## Build Rules

The generated assets are stored outside the repository and referenced only through the stable manuscript storage URLs above. They may establish aesthetic direction but they do not represent biological imagery or scientific data. Any modelled geometry, neural state, or environment data presented beside them will carry explicit provenance labels in the UI.
