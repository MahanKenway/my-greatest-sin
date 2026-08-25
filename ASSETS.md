# Digital Fly Asset Manifest

## Presentation Boundary

Every visual body, garden element, light, and waterfall effect in **My Greatest Sin** is a `MODELLED MAPPING`. None of these assets are neural data, sensory evidence, a connectome, or evidence that an organism is alive. The fly remains **FlyWire v783 staged at 0 N / 0 E**; *C. elegans* executes the separate, integrity-checked **279-neuron / 6,261-edge** source topology.

## Active Presentation Assets

| Asset | Source and licence | Active use | Runtime boundary |
|---|---|---|---|
| Wildtype female *Drosophila melanogaster* | [Sketchfab model](https://sketchfab.com/3d-models/wildtype-female-drosophila-melanogaster-3ba1adba62f34fe995413ee5e9cf3c25), **CC BY 4.0**; user-supplied SHA-256 `5f38f1ce7a3eeeaee4c35449fbe75b9fe766239b8082167ef38897d9698a7349` | A compact 120,000-face derivative was examined, but the supplied GLB contains 17 independent parts with **no skin, joints, or animation tracks**. The active fly is therefore an articulated, modelled presentation with independent wing pivots and three-segment leg rigs, informed by that cited visual reference. | Wing flap, leg gait, body bob and forward motion are explicitly `MODELLED MAPPING`; they neither activate nor substitute FlyWire. |
| *Caenorhabditis elegans* visual reference | [Model by Miguelangelo Rosario](https://sketchfab.com/3d-models/caenorhabditis-elegans-d0591813159a4e8691994f8df58c128d), **CC BY 4.0**; user-supplied SHA-256 `6eea8c9402937f5a2f5fe8968e2fd35a963dbffccd3f266c43274c2163701569` | A single smooth contour body is modelled from the source visual silhouette, after inspection found the supplied science-visualisation GLB contains auxiliary structures that do not read as one organism in the observation bench. | The source reference remains attributed in the species profile. The contour body and its locomotion are modelled presentation, independent of the source topology. |

The original fly is 51.64 MB / 1,229,670 faces. The original worm reference is 30.45 MB / 391,713 faces. Both originals remain outside the project tree. Derivatives, diagnostics, and reports are created outside the repository by scripts in `scripts/data-processing/`; the originals and connectome source data are never committed.

## Garden and Interface Assets

The active garden uses procedural Babylon geometry only: moss beds, a reflective pond and lily, a dedicated wooden bridge, a small rock-and-ribbon waterfall, trees, shrubs, grass, flowers, stones, log, lanterns, and fireflies. It does **not** import a bundled Kenney or other garden GLB at runtime. Grass sway, firefly drift, and waterfall ribbons are decorative animation only.

`DAYLIGHT` changes the background and named Babylon light intensities. `WATERFALL FLOW` changes waterfall opacity and animation rate. They are visibly labelled `GARDEN PRESENTATION / MODELLED` and deliberately do not modify `LIGHT FIELD`, neural data, source topology, sensory routing, or motor mapping.

## Attribution and Distribution Rules

The visible species metadata retains each CC BY 4.0 reference URL and attribution. The FlyWire v783 source pack remains outside the public application under its **CC BY-NC 4.0** boundary; it is not distributed by this repository or by managed presentation storage. Generated images and small UI textures use managed `/manus-storage/...` URLs, never project-local media files.
