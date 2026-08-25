# Digital Fly Asset Manifest

## Presentation Boundary

Every visual body, garden element, light, and waterfall effect in **My Greatest Sin** is a `MODELLED MAPPING`. None of these assets are neural data, sensory evidence, a connectome, or evidence that an organism is alive. The fly remains **FlyWire v783 staged at 0 N / 0 E**; *C. elegans* executes the separate, integrity-checked **279-neuron / 6,261-edge** source topology.

## Active Presentation Assets

| Asset | Source and licence | Active use | Runtime boundary |
|---|---|---|---|
| *Drosophila melanogaster* | [NeLy-EPFL NeuroMechFly](https://github.com/NeLy-EPFL/NeuroMechFly), **Apache-2.0**; public Git LFS source SHA-256 `935780666ab35ca1d8b66e33b928d9f1d10caaf83eff5ed19993b8ebc0291111` | Managed derivative `/manus-storage/neuromechfly-articulated-v5_7bac3435.glb`, SHA-256 `cf9410bf56aa6b18411922a9ec364d4f8a9d17676a2e7d6187bc134b25f142b8`; 65 source mesh parts / 334,428 polygons and 65 rest-pose source-joint pivots. Each mesh is parented to its matching source pivot; the pivots preserve the inspected rest-pose parent hierarchy. | The public source has no authored action. Wing flap, leg gait, body bob and forward motion rotate actual source parts about exported source pivots and are explicitly `MODELLED MAPPING`; they neither activate nor substitute FlyWire. |
| *Caenorhabditis elegans* Cuticle | [WormBase Virtual Worm](http://caltech.wormbase.org/virtualworm/), **MIT**; public February 2012 Blend source SHA-256 `510e9234b65c3890896bf7c0f8b734b219070a97dc68b248596d6f8c8ceb8fea` | Managed derivative `/manus-storage/celegans-cuticle-wave-v2_0cac32a1.glb`, SHA-256 `5535beaf10ca3d40ed2d6b79c80ceb5bf8e653f30bcecd08a9ab0dd836e85cde`; one external Cuticle mesh / 1,992 polygons. | The source has no armature or usable action. The one exported Cuticle morph wave is a presentation-only `MODELLED MAPPING`; its speed and weight receive the decoded forward/reactive motor output from the checksum-verified 279-neuron / 6,261-edge source runtime. |

The original NeuroMechFly Blend is 32 MB and the original WormBase Virtual Worm Blend is 10.85 MB. Both originals remain outside the project tree. Derivatives, diagnostics, and reports are created outside the repository by scripts in `scripts/data-processing/`; the originals and connectome source data are never committed.

## Garden and Interface Assets

The active garden uses procedural Babylon geometry only: moss beds, a reflective pond and lily, a dedicated wooden bridge, a small rock-and-ribbon waterfall, trees, shrubs, grass, flowers, stones, log, lanterns, and fireflies. It does **not** import a bundled Kenney or other garden GLB at runtime. Grass sway, firefly drift, and waterfall ribbons are decorative animation only.

`DAYLIGHT` changes the background and named Babylon light intensities. `WATERFALL FLOW` changes waterfall opacity and animation rate. They are visibly labelled `GARDEN PRESENTATION / MODELLED` and deliberately do not modify `LIGHT FIELD`, neural data, source topology, sensory routing, or motor mapping.

## Attribution and Distribution Rules

The visible species metadata retains the accepted Apache-2.0 and MIT source URLs and attribution. The FlyWire v783 source pack remains outside the public application under its **CC BY-NC 4.0** boundary; it is not distributed by this repository or by managed presentation storage. Generated images, small UI textures and the accepted optimized specimen derivatives use managed `/manus-storage/...` URLs, never project-local media files.
