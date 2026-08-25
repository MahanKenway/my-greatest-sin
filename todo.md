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

## C. elegans Real-Connectome Execution Revision

- [x] Select one authoritative connectome release with explicit terms, version, citation, and permitted download path.
- [x] Download only the selected source tables outside the project tree and record SHA-256 values, sizes, columns, and source URLs.
- [x] Implement a source-specific converter to a provenance-rich C. elegans DFLY manifest and checksummed typed-array chunks.
- [x] Add deterministic source-schema and converter tests without committing the real source data to the repository.
- [x] Add a C. elegans pack activation path that preserves an explicit distinction between `SOURCE DATA` and modelled sensors, motor decoder, and body.
- [ ] Convert a licensed C. elegans model reference into an optimized GLB, upload it to managed web storage, and preserve attribution.
- [ ] Validate checksum loading, species switching, runtime behavior, type checks, tests, production build, and a browser interaction before checkpointing.

## User-Supplied Fly/Worm Repository Review

- [x] Inspect `erojasoficial-byte/fly-brain`, `lixiang1076/fly-brain`, and `heyseth/worm-sim` for code, data, provenance, licenses, and unsafe/undocumented dependencies.
- [x] Determine whether either fly repository contains a real FlyWire-derived 140k-neuron graph, a converter, a model-only approximation, or only visualization assets.
- [x] Cross-check any claimed FlyWire files against official release identifiers, source terms, checksums, and permitted redistribution.
- [x] Compare compatible repository components against the existing DFLY contract and use only clearly licensed, provenance-preserving code or data.
- [ ] If a valid source pack is available, add staged 140k-neuron preflight/cache support; otherwise preserve the explicit no-data boundary and document the blocker.

## Confirmed Official FlyWire v783 Staged Path

- [x] Record the user-confirmed noncommercial use boundary, CC BY-NC 4.0 notice, citations, and no-third-party-mirror rule.
- [x] Retrieve `proofread_root_ids_783.npy` and `proofread_connections_783.feather` directly from the official FlyWire release outside the project tree.
- [x] Verify source file sizes and SHA-256 checksums before any transform.
- [x] Run the existing streaming converter outside the project tree and validate the generated DFLY manifest and every chunk checksum.
- [x] Keep the resulting real-data pack outside the git repository and all public release bundles until the publication gate is separately reviewed.
- [x] Add an explicit FlyWire staged profile with CC BY-NC attribution, source-pack preflight, cache progress and no-CPU-activation warning.
- [x] Add a WebGPU sparse backend capability/benchmark gate before allowing a 140k-neuron pack to execute.

## Remove Fly Synthetic Fallback

- [x] Remove the 96-neuron synthetic LIF fixture from the Drosophila species path.
- [x] Make Drosophila render an explicit staged/idle FlyWire state with no synthetic spikes, neuron count, or synapse count.
- [x] Keep C. elegans source-topology execution and its 279-neuron live HUD unaffected by fly fallback removal.
- [x] Add tests and browser validation for fly staged mode and C. elegans active mode.

## React HUD Key Integrity Fix

- [x] Replace duplicate activity-marker keys with deterministic, unique keys for zero-length and staged-network states.
- [x] Add a regression test that verifies empty and one-neuron activity buffers produce unique marker keys.
- [x] Re-run type checks, tests, production build, and browser-console validation before checkpointing.

## Three-Dimensional Garden Enrichment

- [x] Inventory the current garden props, visual gaps, draw-call budget, and authored-object boundaries.
- [x] Select lightweight, web-ready models or authored substitutes for vegetation, stones, habitat furniture, and sensory props with clear license/attribution records.
- [x] Integrate distinct garden clusters with LOD-friendly Babylon assets and preserve stable simulation controls and labels.
- [x] Validate desktop and mobile composition, frame rate, attribution, type checks, tests, build, and browser rendering before checkpointing.

## Complete Specimen Bodies and Animated Garden

- [x] Define anatomical, licensing, optimization, animation-anchor and provenance requirements for complete fly and worm GLB replacements.
- [x] Find and evaluate clearly licensed, browser-suitable full-body model sources for Drosophila and C. elegans.
- [x] Prepare optimized GLB variants and retain separate causal motor mappings for each specimen.
- [x] Add a small waterfall, wooden bridge, grass sway and firefly-motion effects without coupling them to scientific runtime data.
- [x] Validate dual-species switching, desktop/mobile rendering, performance, type checks, tests, build, browser console and provenance before checkpointing.

## High-Quality User-Supplied Specimen Revision

- [x] Inspect the user-supplied Drosophila and C. elegans GLBs for mesh, material, texture, transform, triangle-budget and attribution metadata.
- [x] Create quality-preserving, browser-safe GLB derivatives outside the project tree and upload only the selected outputs to managed web storage.
- [x] Add modelled `DAYLIGHT` and `WATERFALL FLOW` controls that change Babylon presentation only, never source topology or neural runtime data.
- [x] Replace the current presentation-body URLs, retain separate motor mappings, and document CC BY attribution for the supplied models.
- [x] Remove any garden prop that reads as a duplicate organism or a white placeholder; replace the bridge with a dedicated lightweight wood construction.
- [x] Reframe the supplied C. elegans display pose so its complete silhouette remains legible at rest and during modelled locomotion.
- [x] Validate both selected species, environmental controls, type checks, tests, production build and browser console before checkpointing.

## Articulated Specimen-Motion Revision

- [x] Inspect the node hierarchy, mesh names, local axes, materials and animation data of the active Drosophila GLB.
- [x] Correct the fly’s resting orientation and expose a clear modelled wing-flap signal.
- [x] Build independent modelled wing pivots and three-segment leg rigs because the supplied GLB has no skeleton or animation tracks.
- [x] Replace root-only C. elegans motion with a visible travelling body wave while retaining the source-connectome boundary.
- [x] Validate both species in the browser, then run type checks, tests and a production build before checkpointing.

## Public Rigged Specimen Replacement

- [x] جست‌وجوی مدل‌های عمومیِ واقعی و قابل‌دانلود برای مگس و C. elegans، بدون نیاز به ورود یا CAPTCHA.
- [x] تأیید مجوز، صفحهٔ منبع، ساختار GLB/GLTF، جهت محورها، مواد، شمار مش‌ها و وجود واقعی skeleton یا animation track پیش از ورود به پروژه.
- [x] ردکردن هر مدل بدون بال و پا در مگس، بدون بدن واحد قابل‌تشخیص در کرم، یا دارای قطعات کمکی/محورهای ناپایدار.
- [x] یکپارچه‌سازی دارایی‌های منتخب با هندسهٔ منبع و پیوت/سطح واقعی، و برچسب‌گذاری دقیق هر حرکت تکمیلی به‌عنوان MODELLED MAPPING.
- [x] اعتبارسنجی نشست تازهٔ مرورگر، تعویض گونه، حرکت، کنسول، TypeScript، آزمون‌ها و build پیش از checkpoint.

## GitHub Handoff and Visual Repair

- [x] بررسی remote و شاخهٔ پروژه، سپس ثبت نسخهٔ فعلی در مخزن GitHub منتخب بدون حذف کار محلی.
- [x] بازتولید وضعیت «مدل دیده نمی‌شود / زمین مشکل دارد» در نشست تازه و ثبت علت فنی قابل‌آزمون: مگس حول محور ارتفاع وارونه بود و زمین کوچکِ دارای بافت پرتکرار/کم‌نور خوانایی باغ را کاهش می‌داد.
- [x] اصلاح دوربین، نور، چیدمان مدل یا هندسه/متریال زمین فقط پس از مشاهدهٔ مستقیم اشکال.
- [x] تأیید مگس و C. elegans، تعویض گونه، زمین و کنسول مرورگر؛ سپس اجرای type check، آزمون و build.
- [ ] ثبت checkpoint و گزارش نتیجه با پیوند نسخهٔ GitHub.
