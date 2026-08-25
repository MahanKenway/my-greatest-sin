# Digital Fly Asset Manifest

## Presentation Boundary

Every visual body, garden element, light, and waterfall effect in **My Greatest Sin** is a `MODELLED MAPPING`. None of these assets are neural data, sensory evidence, a connectome, or evidence that an organism is alive. The fly remains **FlyWire v783 staged at 0 N / 0 E**; *C. elegans* executes the separate, integrity-checked **279-neuron / 6,261-edge** source topology.

## Active Presentation Assets

| Asset | Source and licence | Active use | Runtime boundary |
|---|---|---|---|
| *Drosophila melanogaster* | [TuragaLab FlyBody](https://github.com/TuragaLab/flybody), **Apache-2.0**; public `drosophila.blend` source SHA-256 `88c13449572924557ee77e3da2a318643b8a987ac1c7a60b77ed164faa29bead`; local safe inspection found 69 meshes / 145,814 polygons, one armature and zero Actions. | Managed derivative `/manus-storage/flybody-articulated-presentation_4068d305.glb`, SHA-256 `b51e0f7cf9d845fc7315080bf04745991c02e69672c1dc997267b500538d7605`; 68 source mesh parts plus 86 exported rest-pose source-joint pivots. The head, thorax, abdomen, wings, legs and pivots retain their inspected source hierarchy. | The public source has no authored action. Wing flap, leg gait, body bob and forward motion rotate source parts about their exported source pivots and are explicitly `MODELLED MAPPING`; they neither activate nor substitute FlyWire. |
| *Caenorhabditis elegans* continuous body | **Handcrafted presentation geometry** in this repository; no external behavioural or connectome claim. The previously used WormBase Cuticle asset is retired from active presentation. | Managed derivative `/manus-storage/celegans-modelled-continuous-presentation-v3_00dd7cb4.glb`, SHA-256 `276b1955b08a361cb9086c9c97209087d9074950b8cfe788e1ab299dcc2ff7d9`; one continuous mesh with a tapered tail, rounded head collar, subtle cuticle annuli and a 4-curve travelling-wave Action. | The geometry and travelling wave are entirely `MODELLED MAPPING`. Wave speed and weight receive the decoded motor output from the checksum-verified 279-neuron / 6,261-edge source runtime; the GLB is not source anatomy, neural data, or biological behaviour. |

The original public FlyBody Blend remains outside the project tree. Derivatives, diagnostics, and reports are created outside the repository by scripts in `scripts/data-processing/`; external originals and connectome source data are never committed.

## Garden and Interface Assets

The active garden uses procedural Babylon geometry only: moss beds, a reflective pond and lily, a dedicated wooden bridge, a small rock-and-ribbon waterfall, trees, shrubs, grass, flowers, stones, log, lanterns, and fireflies. It does **not** import a bundled Kenney or other garden GLB at runtime. Grass sway, firefly drift, and waterfall ribbons are decorative animation only.

`DAYLIGHT` changes the background and named Babylon light intensities. `WATERFALL FLOW` changes waterfall opacity and animation rate. They are visibly labelled `GARDEN PRESENTATION / MODELLED` and deliberately do not modify `LIGHT FIELD`, neural data, source topology, sensory routing, or motor mapping.

## Attribution and Distribution Rules

The visible species metadata retains the FlyBody Apache-2.0 attribution and explicitly labels the handcrafted worm body as `MODELLED MAPPING`. The FlyWire v783 source pack remains outside the public application under its **CC BY-NC 4.0** boundary; it is not distributed by this repository or by managed presentation storage. Generated images, small UI textures and the accepted optimized specimen derivatives use managed `/manus-storage/...` URLs, never project-local media files.
