# Public Rigged Model Candidates

## Selection constraints

The replacement must be downloadable without an account or CAPTCHA, have a clear redistributable licence, and be checked locally for a valid armature or glTF animation before it can replace a body in the app. A visually detailed mesh without a usable rig is not sufficient for the requested motion.

| Species role | Candidate | Public page finding | Initial decision |
|---|---|---|---|
| Insect with wings and six legs | [Wasp animated — BlendSwap](https://blendswap.com/blend/5882) by krabz | Public listing states **CC BY**, 8.17 MB Blender 2.6x/Cycles, and a walk animation using empties as IK leg targets. Preview depicts a detailed winged six-legged insect. Its actual download route requires sign-in. | **Rejected:** conflicts with the no-login requirement. |
| Worm body | [Worm (rigged) — BlendSwap](https://blendswap.com/blend/2996) by davevanos | Public page exposes a direct `/blend/2996/download` link, lists **CC0**, a 5.95 MB Blender 2.5x file, and declares the model rigged. Preview shows one complete worm body. Comments warn that the rig is simple and has no lattice stretching. | Download and inspect the actual rig, actions and compatibility; reject if export or deformation is unstable. It is a generic worm visual reference, not a C. elegans anatomical source. |

Both candidates are only presentation assets. No visual model changes the C. elegans source topology, FlyWire staged boundary, neural execution, or any claim about biological life.

## Download-path findings

The public [OpenGameArt Flying Terror](https://opengameart.org/content/flying-terror) page provides a direct 615.4 KB archive without account access under CC BY-SA 4.0 and describes fly/attack/death animation. It is a winged demon/monster rather than an anatomically appropriate fly, so it is also **rejected** as a specimen replacement.

| Candidate | Licence and direct file | Rig / animation evidence | Decision |
|---|---|---|---|
| [Butterfly (animated)](https://opengameart.org/content/butterfly-animated) by CDmir and TinyWorlds | **CC0**, direct `Butterfly.zip`, 375.8 KB | Page explicitly states that the low-poly model is rigged, animated and includes a diffuse texture. | Technically suitable fallback for a wing-animation pipeline, but rejected as the primary fly because it is a butterfly rather than a fly-like insect. |
| [Bee](https://opengameart.org/content/bee-0) by MarshReaper | **CC0**, direct 1.7 MB `bee_rigged_v1.1.blend` plus texture | Page declares a rigged mesh, preview contains rig/hover images, but its author says animations will be added later. | Strong candidate for a detailed winged six-legged body, but must be locally inspected and assigned an explicitly modelled animation if the file has no Action. |

## Negative findings for a worm replacement

The public [Kim Hauser model page](https://jetedonner.github.io/posts/3d-models-by-me/) offers a textured, animated snake with a direct file route, but no worm or nematode. It is not an anatomically suitable substitute. The public [itch.io free rigged-assets listing](https://itch.io/game-assets/free/tag-rigged) exposes a CC0 GLB animal pack, but its summary does not identify an insect, worm, or nematode. These sources remain outside the replacement set.

GitHub’s anonymous code-search endpoint currently requires sign-in, so it cannot be used to satisfy the user’s no-login source requirement. Repository browsing remains possible, but it is not used as evidence that an undownloaded binary asset is available.

## Official C. elegans visual-model candidate

The [WormBase Virtual Worm Project](http://caltech.wormbase.org/virtualworm/) identifies its model as a virtual three-dimensional *C. elegans* anatomical atlas and states that it is disseminated under the **MIT licence** with attribution. Its public directory at [Virtual Worm Blend File](http://canopus.caltech.edu/virtualworm/Virtual%20Worm%20Blend%20File/) exposes four versioned `.blend` downloads without an account, including `Virtual_Worm_February_2012.blend`. This is the most taxonomically aligned candidate found so far. Its rig, animation data, mesh topology, and web-export safety must be inspected locally before selection.

## Local technical inspection

| Candidate | Verified local structure | Decision |
|---|---|---|
| OpenGameArt Bee CC0 | SHA-256 `0cc0a75a8b545d87b4c88dfd0017e8d3364dbf25b1a249e218a43ef886a9df26`; one skinned 477-face mesh, one armature with explicit `wing.l`, `wing.r`, paired leg-chain bones, antennae and head; five Actions including `hovering-loop`, `idle-loop` and `run-loop`. | **Selected for the winged-insect presentation test.** It is an insect surrogate, not a Drosophila anatomical claim. |
| WormBase Virtual Worm, February 2012 | SHA-256 `510e9234b65c3890896bf7c0f8b734b219070a97dc68b248596d6f8c8ceb8fea`; 825 meshes / 106,148 polygons; an unambiguous `Cuticle` mesh with 1,010 polygons and Hypodermis material; zero armatures and no usable Action. | **Selected only as a real C. elegans surface source.** It needs a non-source deformation layer before it can visibly locomote. |

Blendkit’s free CC0 Sandworm is rejected for this task because the page exposes a login-gated acquisition route and depicts a fictional monster. Meshy’s public worm index describes static meshes and prompts sign-up, so it is also rejected.

## Render review gate

The locally rendered CC0 Bee asset is structurally valid but visually a bipedal/cartoon character with arm-like limbs, so it is **rejected** for the fly body despite having a real armature and Actions. The first Virtual Worm GLB render confirms the genuine cuticle is present but also shows an unwanted source helper cube. The cube must be excluded from the export before the cuticle can be considered for the C. elegans presentation test. Neither asset has been integrated into the web application.

## Official fly candidate: NeuroMechFly

The public [NeLy-EPFL/NeuroMechFly](https://github.com/NeLy-EPFL/NeuroMechFly) repository is licensed **Apache-2.0** and hosts `data/design/blender/neuromechfly_full_model.blend` through Git LFS. The downloaded 32 MB Blender 2.91 source has SHA-256 `935780666ab35ca1d8b66e33b928d9f1d10caaf83eff5ed19993b8ebc0291111` and is a detailed adult *Drosophila* biomechanical model: 65 meshes / 304,351 polygons, one armature, named `LWing`/`RWing`, six complete leg chains (`Coxa`, `Femur`, `Tibia`, five tarsal bones per leg), antennae, halteres, head, eyes, rostrum and thorax. It contains no authored Actions, so any hover or walk Action added to its existing source armature must remain labelled **MODELLED MAPPING**. This candidate passes the model-quality and real-joint gate; it requires export and visual validation before application use.

The first browser-format export includes two animation clips with 650 f-curves each, but its initial render is dominated by an unintended large helper cube or bounding element. The export is therefore **not eligible for integration yet**; the auxiliary object must be identified and removed, then the real fly must be rendered at two distinct frames before use.

The helper geometry was from Blender's default inspection scene, not the selected specimen derivative. The cleaned browser derivative exports the actual NeuroMechFly parts as individually named `nmf__<joint>` meshes, including named wing and leg-chain parts, so Babylon can animate their original pivots directly.

### Accepted local derivatives pending browser integration

The cleaned **NeuroMechFly v4** derivative contains exactly **65 source mesh parts** (334,428 polygons) and **65 non-rendering source-joint pivots**. It contains no source armature and no source action, which accurately reflects that the Apache-2.0 source has joints but no authored clip. It preserves the published legs, wings, antennae, eyes, halteres and named leg chains while allowing Babylon to make explicitly labelled `MODELLED MAPPING` rotations around the published rest-pose joint locations. Its local SHA-256 is `9342c470b80c82db8cb617961c49fc13d7bd73efb40ce86e761aef7949d30fc5`.

The cleaned **WormBase Virtual Worm v2** derivative contains exactly **one** external `Cuticle` mesh (1,992 polygons), no armature and no helper meshes. It contains one exported animation group, `MODELLED_C_ELEGANS_BODY_WAVE_Cuticle`; this is a presentation-only morph wave made from the MIT-licensed source Cuticle and is not source behavior or connectome data. Its side-view render is one continuous worm surface without duplicate bodies or auxiliary geometry. Its local SHA-256 is `5535beaf10ca3d40ed2d6b79c80ceb5bf8e653f30bcecd08a9ab0dd836e85cde`.
